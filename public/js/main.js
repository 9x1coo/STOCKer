import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {query, getFirestore, doc, addDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// let currentUserId = 1;
let dataRows = [];
let currentUser = "";

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
        loadContent('inventory.html');
        loadData()
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
        loadData()
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

//display the data in the table
function addToTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const newRow = document.createElement('tr');

    const itemPhotoHtml = data.itemPhoto ? `<img src="${data.itemPhoto}" alt="Item Photo" width="200" height="200">` : '';

    newRow.innerHTML = `
        <td>${data.index}</td>
        <td>${data.name}<br>${itemPhotoHtml}</td>
        <td>${data.price}</td>
        <td>${data.quanitty}</td>
        <td>${data.barcode}</td>
        <td>${data.supplierName}</td>
        <td>${data.supplierContact}</td>
        <td>${data.dateUpdate}</td>
        <td>${data.description}</td>
        <td>${data.max}</td>
        <td>${data.min}</td>
        <td><span><button data-id="${data.id}" class="btn btn-primary edit-btn" style="margin:5px;"><i class="fa-solid fa-pen fa-lg" style="color: #ffffff;"></i></button><button data-id="${data.id}" class="btn btn-primary delete-btn" style="background-color:#d73200;"><i class="fa-regular fa-trash-can fa-lg" style="color: #ffffff;"></i></button></span></td>
    `;
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }
}

//load the data from firestore to the table
async function loadData() {
    const dataRowsCollection = query(collection(firestore, 'Inventory'), orderBy("id", "asc"));
    const querySnapshot = await getDocs(dataRowsCollection);
    
    let dataRows = []; // Temporary array to store data  
    let index = 1;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.index = index++;
        data.id = doc.id;
        dataRows.push(data);
    });
    
    // currentId = dataRows.length ? parseInt(dataRows[dataRows.length - 1].id) + 1 : 1;
    
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';
    dataRows.forEach(data => addToTable(data));
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
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); 

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
  const quantity = document.getElementById('quantity-input').value +" "+ document.getElementById('unit-input').value;
  const barcode = document.getElementById('barcode-input').value;
  const supplier = document.getElementById('supplier-input').value;
  const dateUpdate = getDate();
  const userUpdate = currentUser;
  const description = document.getElementById('description-input').value;
  const min = document.getElementById('low-stock-input').value;
  const max = document.getElementById('over-stock-input').value;

  if (name && item && dateExpectedReturn) {
    try {
        const data = { name, itemPhoto, price, quantity, barcode, description, supplier, dateUpdate, userUpdate, min, max };
        const docRef = await addDoc(collection(firestore, 'Inventory'), data);
        data.id = docRef.id; 

        // Update UI
        dataRows.push(data);
        addToTable(data);
        resetInput();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
  } else {
      alert('Please fill out all required fields.');
  }
}

//===================================================//
//================Inventory Code End=================//
//===================================================//





// window.addEventListener("load", function() {
//     checkUserAuth();
// });

function loadContent(page) {
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

            // Inventory supplier selection button
            const supplierButton = document.getElementById("supplier-input");
            const supplierDropdownItems = document.querySelectorAll("#supplier-input + .dropdown-menu .dropdown-item");
            if (supplierButton && supplierDropdownItems.length) {
                supplierDropdownItems.forEach(item => {
                    item.addEventListener("click", function () {
                        supplierButton.textContent = this.textContent;
                    });
                });
            }

            // Open Supplier Modal
            let addSupplierBtn = document.getElementById("add-new-supplier");
            let modal = document.getElementById('supplierPromptModal');
            let closeBtn = document.getElementById('closeBtn');

            if (addSupplierBtn) {
                addSupplierBtn.addEventListener("click", function() {
                    modal.style.display = 'block';
                });
            }

            // Close Supplier Modal
            if (closeBtn) {
                closeBtn.addEventListener("click", function() {
                    modal.style.display = 'none';
                });
            }

            // Close when clicking outside modal
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
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
