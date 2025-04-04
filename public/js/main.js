import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {query, serverTimestamp, getFirestore, doc, addDoc, setDoc, collection, getDocs, getDoc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = "";
let currentSortOrder = 'desc';

const firebaseApp = initializeApp({
    apiKey: "AIzaSyA7TsXEByLxZLuPga32MlbBzI92zSXpelY",
    authDomain: "stocker-83325.firebaseapp.com",
    projectId: "stocker-83325",
    storageBucket: "stocker-83325.firebasestorage.app",
    messagingSenderId: "364662570826",
    appId: "1:364662570826:web:e5ae09dcc83d81acc24bb3",
    measurementId: "G-ZMLHCEF9H3"
});

const firestore = getFirestore(firebaseApp);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in: ", user);
        currentUser = user.email;
        document.getElementById('logout-btn').style.display = "block";
        document.getElementById('login-btn').style.display = "none";

        loadContent('inventory.html', () => {
            loadSuppliers();
            loadData();
        }); 
    } else {
        console.log("No user is logged in.");
        loadContent('home.html');
    } 
});

// function checkUserAuth() {
    // onAuthStateChanged(auth, (user) => {
    //     if (user && window.location.pathname.includes("main.html")) {
    //         console.log("User is logged in: ", user);
    //         loadContent("inventory.html");
    //         // window.location.replace("inventory.html");
    //     } else if (!user && window.location.pathname.includes("main.html")) {
    //         console.log("No user is logged in.");
    //         loadContent("home.html")
    //         // window.location.replace("main.html");
    //     }
    // });
// }

function handleLogout() {
    signOut(auth)
        .then(() => {
            loadContent('home.html');
            alert('You have successfully logged out.');
        })
        .catch((error) => {
            console.error("Error signing out:", error.message);
            alert('Error logging out: ' + error.message); 
        });
}

// Login Function with Firebase Authentication
async function checkUserLogin() {
    const email = document.getElementById('login-email-input').value;
    const password = document.getElementById('login-password-input').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        loadContent('inventory.html');
    } catch (error) {
        document.getElementById('error-message').style.display = "block";
    }
} 

// Signup Function with Firebase Authentication
async function getSignupInputData() {
    const email = document.getElementById('signup-email-input').value;
    const password = document.getElementById('signup-password-input').value;

    const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\/\\;:'",<>\?]/.test(password);

    if (!validateEmail) {
        document.getElementById('error-email').style.display = "block";
    } else {
        document.getElementById('error-email').style.display = "none";
    }

    if (password.length < minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        document.getElementById('error-password').style.display = "block";
        console.log("Password validation failed!");
    } else { 
        document.getElementById('error-password').style.display = "none";

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // User created successfully
            // const user = userCredential.user;
            // console.log("User created:", user);

            // Optionally, you can add additional user data to Firestore
            // const data = { email };
            // const docRef = await addDoc(collection(firestore, 'user'), { ...data, uid: user.uid });
            // dataRows.push({ id: docRef.id, ...data });

            alert('Sign Up successful! You may login now.');
            loadContent('login.html');

        } catch (error) {
            console.error("Error signing up:", error.message);
            alert("Error signing up. Please try again.");
        }
    }
}



//===================================================//
//===============Inventory Code Start================//
//===================================================//
//get the current date time
function getDate(){
    const now = new Date();

    const pad = (num) => (num < 10 ? '0' : '') + num;

    const year = now.getFullYear(); 
    const month = pad(now.getMonth() + 1);
    const date = pad(now.getDate()); 
    const hours = pad(now.getHours()); 
    const minutes = pad(now.getMinutes()); 
    const seconds = pad(now.getSeconds()); 

    const formattedDateTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
}

//clear the input
function resetInput(){
    document.getElementById('comfirm-btn').style.display = 'block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('itemPhotoImg').style.display = 'none';
  
    document.getElementById('name-input').value = "";
    document.getElementById('item-input').value = "";
    document.getElementById('date-input').value = "";
    document.getElementById('remarks-input').value = "";
    document.getElementById('photo-input-url').value = "";
}

//display the data in the table
function addToTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const newRow = document.createElement('tr');

    const itemPhotoHtml = data.itemPhoto ? `<img src="${data.itemPhoto}" alt="Item Photo" width="200" height="200">` : '';

    if (data.quantity < data.min) {
        newRow.style.backgroundColor = '#fff3cd';
    } else if (data.quantity > data.max) {
        newRow.style.backgroundColor = '#f8d7da';
    }

    newRow.innerHTML = `
        <td>${data.index}</td>
        <td>${data.name}<br>${itemPhotoHtml}</td>
        <td>${data.price}</td>
        <td>${data.quantity}</td> 
        <td>${data.barcode}</td>
        <td>${data.supplierName}</td>
        <td>${data.supplierContact}</td>
        <td>${data.dateUpdate}</td>
        <td>${data.userUpdate}</td>
        <td>${data.description}</td>
        <td>${data.min}</td>
        <td>${data.max}</td>
        <td><span><button data-id="${data.id}" class="btn btn-primary edit-btn" style="margin:5px;"><i class="fa-solid fa-pen fa-lg" style="color: #ffffff;"></i></button><button data-id="${data.id}" class="btn btn-primary delete-btn" style="background-color:#d73200;"><i class="fa-regular fa-trash-can fa-lg" style="color: #ffffff;"></i></button></span></td>
    `;

    console.log("Rows added!!");
    tableBody.appendChild(newRow);
}

//load the data from firestore to the table
async function loadData() {
    const dataRowsCollection = query(collection(firestore, 'Inventory'), orderBy("dateAdded", currentSortOrder));
    const querySnapshot = await getDocs(dataRowsCollection);

    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    let index = 1;
    let count = 0;

    for (const docs of querySnapshot.docs) {
        const data = docs.data();
        data.index = index++;
        data.id = docs.id;

        const supplierDocRef = doc(firestore, 'Supplier', data.supplier);
        const supplierDoc = await getDoc(supplierDocRef);
        const supplier = supplierDoc.exists() ? supplierDoc.data() : null;

        if (data.quantity < data.min || data.quantity > data.max) count++;

        if (supplier) {
            data.supplierName = supplier.name;
            data.supplierContact = supplier.contact;
        } else {
            data.supplierName = "Unknown";
            data.supplierContact = "N/A";
        }

        addToTable(data);
    }

    if (count > 0) {
        document.getElementById('noti-count').innerText = count;
        document.getElementById('notiPromptModal').style.display = 'block';
        console.log("Show noti");
    }
}

//take photo
function handlePhotoSelection(event) {
    const file = event.target.files[0]; 
    console.log("clicked");
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const img = new Image();

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas dimensions
                const MAX_WIDTH = 200; 
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;

                // Preserving aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height); //canvas cannot accept dataUrl

                console.log("got image!");

                // Compress the image
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.2);

                const camera = document.getElementById('itemPhotoImg');
                camera.src = compressedDataUrl;
                camera.style.display = 'block'; 
                document.getElementById('photo-input-url').value = compressedDataUrl;
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }
}

//get data from input
async function getInputData() {
    const name = document.getElementById('item-input').value;
    const itemPhoto = document.getElementById('photo-input-url').value;
    const price = document.getElementById('price-input').value;
    const quantity = document.getElementById('quantity-input').value +" "+ document.getElementById('unit-input').textContent + "(s)";
    const barcode = document.getElementById('barcode-input').value;
    const supplier = document.getElementById('supplier-input-id').value;
    const dateUpdate = getDate();
    const userUpdate = currentUser;
    const description = document.getElementById('description-input').value;
    const min = document.getElementById('low-stock-input').value;
    const max = document.getElementById('over-stock-input').value;
    const dateAdded = serverTimestamp();

    if (parseInt(min) >= parseInt(max)){
        alert('Low stock\'s alert should not be more than over stock.');
    } else if (name.trim() && price.trim() && quantity.trim() && (parseInt(min) < parseInt(max)) && !quantity.includes("Select") && !supplier.includes("Select")) { 
        try {
            const data = { name, itemPhoto, price, quantity, barcode, description, supplier, dateUpdate, userUpdate, min, max, dateAdded };
            const docRef = await addDoc(collection(firestore, 'Inventory'), data);
            data.id = docRef.id; 

            // Update UI
            console.log("Data added");
            loadData(); 
            // resetInput();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    } else {
        alert('Please fill out all required fields.');
    }
}

// Load supplier to list
async function loadSuppliers() {
    const dropdownMenu = document.getElementById('supplier-dropdown-menu');
    dropdownMenu.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(firestore, 'Supplier'));
        console.log("Supplierrrr");

        if (querySnapshot.empty) {
            const defaultData = { name: 'Unknown Supplier', contact: 'N/A' };
            const docRef = await addDoc(collection(firestore, 'Supplier'), defaultData);
            console.log('Default supplier added:', docRef.id);
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();

            const supplierItem = document.createElement('a');
            supplierItem.className = 'dropdown-item d-flex justify-content-between align-items-center';
            supplierItem.innerHTML = `
                <span>${data.name}</span>
                <button data-id="${doc.id}" class="cancel-btn btn btn-sm btn-danger ms-2">-</button>
            `;
            supplierItem.addEventListener('click', function (e) {
                if (e.target.classList.contains('cancel-btn')){
                    deleteSupplier(doc.id);
                    document.getElementById('supplier-input').disabled = true;
                } 
                document.getElementById('supplier-input').textContent = data.name;
                document.getElementById('supplier-input-id').value = doc.id;
            });

            dropdownMenu.appendChild(supplierItem);
        });

        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        const addNew = document.createElement('a');
        addNew.className = 'dropdown-item';
        addNew.id = 'add-new-supplier';
        addNew.textContent = '+ Add New Supplier';
        dropdownMenu.appendChild(divider);
        dropdownMenu.appendChild(addNew);

        addNew.addEventListener("click", function () {
            document.getElementById('supplierPromptModal').style.display = 'block';
        });

    } catch (error) {
        console.error("Error loading suppliers: ", error);
    }
}

// Delete Supplier
async function deleteSupplier(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            await deleteDoc(doc(firestore, 'Supplier', id));
            await loadSuppliers();
            document.getElementById('supplier-input').textContent = "Select Supplier";
            document.getElementById('supplier-input-id').value = "";
            console.log("deleteeeee");
            document.getElementById('supplier-input').disabled = false;
        } catch (error) {
            console.error("Error deleting supplier: ", error);
        }
    }
}

// Supplier get input
async function getSupplierData() {
    const name = document.getElementById('supplier-name-input').value;
    const contact = document.getElementById('supplier-contact-input').value;

    if (name && contact) { 
        try {
            document.getElementById('supplierPromptModal').style.display = 'none';
            document.getElementById('supplier-name-input').value = "";
            document.getElementById('supplier-contact-input').value = "";
            document.getElementById('supplier-input').disabled = true;

            const data = { name, contact };
            const docRef = await addDoc(collection(firestore, 'Supplier'), data);
            data.id = docRef.id; 

            await loadSuppliers();
            document.getElementById('supplier-input').disabled = false;
        } catch (error) {
            console.error("Error adding supplier: ", error);
        }
    } else {
        alert('Please fill out all required fields.');
    }
}

// search 
function searchTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('data-table-body');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].textContent.toLowerCase();
        rows[i].style.display = rowText.includes(input) ? '' : 'none';
    }
}
//===================================================//
//================Inventory Code End=================//
//===================================================//



// window.addEventListener("load", function() {
//     checkUserAuth();
// });

function loadContent(page, callback) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-content').innerHTML = data;

            // Load login page
            document.getElementById("login-btn")?.addEventListener("click", function() {
                loadContent("login.html");
            }); 
            document.getElementById("logout-btn")?.addEventListener("click", function() {
                handleLogout();
            }); 
            document.getElementById("login-start-btn")?.addEventListener("click", function() {
                loadContent("login.html");
            });
            document.getElementById("signup-btn")?.addEventListener("click", function() {
                loadContent("signup.html");
            }); 

            // Login page comfirm button
            document.getElementById('login-comfirm-btn')?.addEventListener('click', async () => {
                await checkUserLogin();
            });

            // Sign up page comfirm button
            document.getElementById('signup-comfirm-btn')?.addEventListener('click', async () => {
                await getSignupInputData();
            });

            // Inventory page comfirm button
            document.getElementById('inventory-comfirm-btn')?.addEventListener('click', async () => {
                await getInputData();
            });

            // Inventory take photo button
            document.getElementById('photo-btn')?.addEventListener('click', function() {document.getElementById('take-photo-input').click();});
            document.getElementById('take-photo-input')?.addEventListener('change', handlePhotoSelection);

            // Inventory price input
            document.getElementById('price-input')?.addEventListener('input', function () {
                
                let val = this.value.replace(/[^0-9.]/g, '');                
                const dotIndex = val.indexOf('.');
     
                if (dotIndex !== -1) {
                  val = val.slice(0, dotIndex + 1) + val.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2);
                }
            
                if (val.startsWith('.')) val = '0' + val;
            
                this.value = val;
            });

            // Inventory unit selection button
            const unitButton = document.getElementById("unit-input");
            const unitDropdownItems = document.querySelectorAll("#unit-input + .dropdown-menu .dropdown-item");
            if (unitButton && unitDropdownItems.length) {
                unitDropdownItems.forEach(item => {
                    item.addEventListener("click", function () {
                        unitButton.textContent = this.textContent;
                    });
                });
            }

            // Inventory barcode input
            document.getElementById('barcode-input')?.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });

            // Inventory supplier selection button
            // const supplierButton = document.getElementById("supplier-input");
            // const supplierDropdownItems = document.querySelectorAll("#supplier-input + .dropdown-menu .dropdown-item");
            // if (supplierButton && supplierDropdownItems.length) {
            //     supplierDropdownItems.forEach(item => {
            //         item.addEventListener("click", function () {
            //             supplierButton.textContent = this.textContent;
            //         });
            //     });
            // }

            // Inventory Open Supplier Modal
            let addSupplierBtn = document.getElementById("add-new-supplier");
            let modal = document.getElementById('supplierPromptModal');
            let closeBtn = document.getElementById('closeBtn');
            let notiModal = document.getElementById('notiPromptModal');
            let notiCloseBtn = document.getElementById('notiCloseBtn');
            let notiOkBtn = document.getElementById('noti-confirm-btn');

            if (addSupplierBtn) {
                addSupplierBtn.addEventListener("click", function() {
                    modal.style.display = 'block';
                });
            }
            // Inventory Close Supplier Modal
            if (closeBtn) {
                closeBtn.addEventListener("click", function() {
                    modal.style.display = 'none';
                });
            }
            if (notiCloseBtn || notiOkBtn) {
                notiCloseBtn.addEventListener("click", function() {
                    notiModal.style.display = 'none';
                });
                notiOkBtn.addEventListener("click", function() {
                    notiModal.style.display = 'none';
                });
            }
            // Inventory Close when clicking outside modal
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
                if (event.target == notiModal) {
                    notiModal.style.display = 'none';
                }
                
            };
            // Inventory supplier comfirm button
            document.getElementById('supplier-confirm-btn')?.addEventListener('click', async () => {
                await getSupplierData();
            });

            // Inventory adjuct order of table button
            document.getElementById('sort-btn')?.addEventListener('click', () => {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                loadData();
                document.getElementById('sort-btn').innerHTML = currentSortOrder === 'asc' ? '<i class="fa-solid fa-arrow-up-wide-short fa-xl sort-button">' : '<i class="fa-solid fa-arrow-down-short-wide fa-xl sort-button">';
            }); 

            // Inventory search
            document.getElementById('searchInput')?.addEventListener('input', function() {
                searchTable();
            }); 

            // Inventory export data to excel file
            document.getElementById('exportBtn')?.addEventListener('click', function(){
              const headers = ["ID", "NAME", "ITEM", "DATEBORROW", "DATEEXPECTEDRETURN", "DATERETURN", "REMARKS"];

              const modifiedDataRows = dataRows.map(row => {
                  return {
                      ID: row.id,
                      NAME: row.name,
                      ITEM: row.item,
                      DATEBORROW: row.dateBorrow,
                      DATEEXPECTEDRETURN: row.dateExpectedReturn,
                      DATERETURN: typeof row.dateReturn === 'string' && row.dateReturn.includes("button") ? "Not returned" : row.dateReturn,
                      REMARKS: row.remarks
                  };
              });

              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.json_to_sheet(modifiedDataRows, { header: headers });

              XLSX.utils.book_append_sheet(wb, ws, "Data");
              XLSX.writeFile(wb, "Robot_Inventory.xlsx");
            });



 
            if (typeof callback === 'function') {
                callback();
            } 

        })
        .catch(error => console.error('Error loading content:', error));
}
 
if (window.location.pathname.includes("main.html")) {
    loadContent('inventory.html');
}








(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1000, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });
})(jQuery);
