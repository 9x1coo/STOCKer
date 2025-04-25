import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {query, serverTimestamp, getFirestore, doc, addDoc, collection, getDocs, getDoc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;
let currentUserEmail = "";
let currentSortOrder = 'desc';

let inventoryCol = null;
let cupplierCol = null;

let allData = [];

const firebaseApp = initializeApp(window.FIREBASE_CONFIG);

const firestore = getFirestore(firebaseApp);
const auth = getAuth();
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, async (user) => {
    document.getElementById('spinner').style.display = "block";
    if (user) {
        await user.reload();
        if (user.emailVerified) {
            console.log("User is verified: ", user.emailVerified);
            console.log("User is logged in: ", user);
            currentUser = user.uid;
            currentUserEmail = user.email;
            inventoryCol = `users/${currentUser}/Inventory`;
            cupplierCol = `users/${currentUser}/Supplier`;
            document.getElementById('logout-btn').style.display = "block";
            document.getElementById('login-btn').style.display = "none";
            loadContent('inventory.html', () => {
                loadSuppliers();
                loadData();
                document.getElementById('spinner').style.display = "none";
            }); 
            document.getElementById('logo-btn').disabled = true;
        } else {
            console.log("User is not verified. Logging out.");
            await handleLogout();
            document.getElementById('spinner').style.display = "none";
        }
    } else {
        console.log("No user is logged in.");
        loadContent('home.html');
        document.getElementById('logo-btn').disabled = false;
    }
});


// send verification email
async function sendEmail(user) {
    sendEmailVerification(user)
        .then(() => {
            console.log('Email verification sent!');
            alert('Please check your email to verify your account.');
        })
        .catch((error) => {
            console.error('Error sending email verification:', error.message);
            alert('Email not found! Please check your email!');
        });
}

//logout user
async function handleLogout() {
    try {
        await signOut(auth);
        document.getElementById('logout-btn').style.display = "none";
        document.getElementById('login-btn').style.display = "block";
        loadContent('home.html');
    } catch (error) {
        console.error("Error signing out:", error.message);
        alert('Error logging out: ' + error.message);
    }
}

// Login Function with Firebase Authentication
async function checkUserLogin() {
    const email = document.getElementById('login-email-input').value;
    const password = document.getElementById('login-password-input').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await user.reload();

        if (!user.emailVerified) {
            await sendEmail(user);
            await handleLogout();
        }
    } catch (error) {
        console.error('Error logging in user:', error.message);
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
    } else { 
        document.getElementById('error-password').style.display = "none";

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await sendEmail(user);
            await handleLogout();
        } catch (error) {
            console.error("Error signing up:", error.message);
            alert("Error signing up. Please try again.");
        }
    }
}

// Reset password
async function resetPassword() {
    const email = document.getElementById('forgot-email-input').value;

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Check your inbox.');
        document.getElementById('error-email').style.display = "none";
        loadContent('home.html');
    } catch (error) {
        console.error("Error sending password reset email:", error.message);
        if (error.code === 'auth/user-not-found') {
            document.getElementById('error-email').innerText = "This email is not registered.";
        } else if (error.code === 'auth/invalid-email') {
            document.getElementById('error-email').innerText = "Invalid email format.";
        } else {
            document.getElementById('error-email').innerText = "Something went wrong. Please try again.";
        }
        document.getElementById('error-email').style.display = "block";
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
function resetInput() {
    document.getElementById('item-input').value = '';
    document.getElementById('photo-input-url').value = '';
    document.getElementById('itemPhotoImg').src = '';
    document.getElementById('itemPhotoImg').style.display = 'none';

    document.getElementById('price-input').value = '';
    document.getElementById('quantity-input').value = 0;
    document.getElementById('unit-input').innerText = 'Select Unit';

    document.getElementById('barcode-input').value = '';
    document.getElementById('supplier-input').innerText = 'Select Supplier';
    document.getElementById('supplier-input-id').value = '';

    document.getElementById('description-input').value = '';
    document.getElementById('low-stock-input').value = 0;
    document.getElementById('over-stock-input').value = 0;

    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('inventory-comfirm-btn').style.display = 'block';
}

// get input
function getInput() {
    const name = document.getElementById('item-input').value;
    const itemPhoto = document.getElementById('photo-input-url').value;
    const price = parseFloat(document.getElementById('price-input').value);
    const quantity = parseInt(document.getElementById('quantity-input').value);
    const unit = document.getElementById('unit-input').textContent;
    const barcode = document.getElementById('barcode-input').value;
    const supplier = document.getElementById('supplier-input-id').value;
    const description = document.getElementById('description-input').value;
    const min = parseInt(document.getElementById('low-stock-input').value);
    const max = parseInt(document.getElementById('over-stock-input').value);
    const dateUpdate = getDate();

    return { name, itemPhoto, price, quantity, unit, barcode, supplier, description, min, max, dateUpdate };
}

// edit data
async function handleEdit(id, dateAdded) {
    try {
        const docRef = doc(firestore, inventoryCol, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error(`Document with ID ${id} not found.`);
            return;
        }

        const dataToEdit = docSnap.data();
        dataToEdit.id = id;

        document.getElementById('inventory-comfirm-btn').style.display = 'none';
        document.getElementById('save-btn').style.display = 'block';
        document.getElementById('cancel-btn').style.display = 'block';

        document.getElementById('item-input').value = dataToEdit.name || '';
        document.getElementById('photo-input-url').value = dataToEdit.itemPhoto || '';
        document.getElementById('itemPhotoImg').src = dataToEdit.itemPhoto || '';
        document.getElementById('itemPhotoImg').style.display = dataToEdit.itemPhoto ? 'block' : 'none';

        document.getElementById('price-input').value = dataToEdit.price || '';
        document.getElementById('quantity-input').value = dataToEdit.quantity || '';
        document.getElementById('unit-input').innerText = dataToEdit.unit;
        document.getElementById('barcode-input').value = dataToEdit.barcode || '';

        document.getElementById('supplier-input-id').value = dataToEdit.supplier || '';
        const supplierDocRef = doc(firestore, cupplierCol, dataToEdit.supplier);
        const supplierDoc = await getDoc(supplierDocRef);
        const supplier = supplierDoc.exists() ? supplierDoc.data() : null;
        if (supplier) {
            document.getElementById('supplier-input').innerText = supplier.name || 'Select Supplier';
        } else {
            document.getElementById('supplier-input').innerText = 'Select Supplier';
        }

        document.getElementById('description-input').value = dataToEdit.description || '';
        document.getElementById('low-stock-input').value = dataToEdit.min || '';
        document.getElementById('over-stock-input').value = dataToEdit.max || '';

        // Save the edits
        document.getElementById('save-btn').onclick = async function () {
            const updatedData = getInput();
            updatedData.id = id;
            updatedData.dateAdded = dateAdded;

            if (updatedData.min >= updatedData.max){
                alert('Low stock\'s alert should not be more than over stock.');
            } else if (updatedData.name && updatedData.price && !isNaN(updatedData.price) && !isNaN(updatedData.quantity) && !updatedData.unit.includes("Select") && !updatedData.supplier.includes("Select")) { 
                try {
                    await updateDoc(doc(firestore, inventoryCol, id), updatedData);
                    await loadData();
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            } else {
                alert('Please fill out all required fields.');
            }

            resetInput();
        };

        document.getElementById('cancel-btn').onclick = function () {
            resetInput();
        };

    } catch (error) {
        console.error("Error loading item for edit:", error);
    }
}

// delete data
async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await deleteDoc(doc(firestore, inventoryCol, id));
            await loadData();
        } catch (error) {
            console.error("Error deleting supplier: ", error);
        }
    }
}

//display the data in the table
function addToTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const newRow = document.createElement('tr');

    const itemPhotoHtml = data.itemPhoto ? `<img src="${data.itemPhoto}" alt="Item Photo" width="200" height="200">` : '';

    if (parseInt(data.quantity) < parseInt(data.min)) {
        newRow.style.backgroundColor = '#fff3cd';
    } else if (parseInt(data.quantity) > parseInt(data.max)) {
        newRow.style.backgroundColor = '#f8d7da';
    }

    newRow.innerHTML = `
        <td>${data.index}</td>
        <td>${data.name}<br>${itemPhotoHtml}</td>
        <td>${data.price}</td>
        <td>${data.quantity} ${data.unit}(s)</td>
        <td>${data.barcode}</td>
        <td>${data.supplierName}</td>
        <td>${data.supplierContact}</td>
        <td>${data.description}</td>
        <td>${data.min}</td>
        <td>${data.max}</td>
        <td>${data.dateUpdate}</td>
        <td>
            <span>
                <button data-id="${data.id}" class="btn btn-primary edit-btn" style="margin:5px;">
                    <i class="fa-solid fa-pen fa-lg" style="color: #ffffff;"></i>
                </button>
                <button data-id="${data.id}" class="btn btn-primary delete-btn" style="background-color:#d73200;">
                    <i class="fa-regular fa-trash-can fa-lg" style="color: #ffffff;"></i>
                </button>
            </span>
        </td>
    `;

    tableBody.appendChild(newRow);

    const editBtn = newRow.querySelector('.edit-btn');
    const deleteBtn = newRow.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => handleEdit(data.id, data.dateAdded));
    deleteBtn.addEventListener('click', () => handleDelete(data.id));
}

//load the data from firestore to the table
async function loadData() { 
    const dataRowsCollection = query(collection(firestore, inventoryCol), orderBy("dateAdded", currentSortOrder));
    const querySnapshot = await getDocs(dataRowsCollection);

    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    let index = 1;
    let count = 0;

    for (const docs of querySnapshot.docs) {
        const data = docs.data();
        data.index = index++;
        data.id = docs.id;

        const supplierDocRef = doc(firestore, cupplierCol, data.supplier);
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

        allData.push(data);

        addToTable(data);
    }

    if (count > 0) {
        document.getElementById('noti-count').innerText = count;
        document.getElementById('notiPromptModal').style.display = 'block';
    }
}

//take photo
function handlePhotoSelection(event) {
    const file = event.target.files[0]; 
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
async function saveInputData() {
    const data = getInput();
    data.dateAdded = serverTimestamp();

    if (data.min >= data.max){
        alert('Low stock\'s alert should not be more than over stock.');
    } else if (data.name && data.price && !isNaN(data.price) && !isNaN(data.quantity) && !data.unit.includes("Select") && !data.supplier.includes("Select")) { 
        try {
            const docRef = await addDoc(collection(firestore, inventoryCol), data);
            data.id = docRef.id;
            loadData();
            resetInput();
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
        const querySnapshot = await getDocs(collection(firestore, cupplierCol));

        if (querySnapshot.empty) {
            const defaultData = { name: 'Unknown Supplier', contact: 'N/A' };
            const docRef = await addDoc(collection(firestore, cupplierCol), defaultData);
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
            await deleteDoc(doc(firestore, cupplierCol, id));
            await loadSuppliers();
            document.getElementById('supplier-input').textContent = "Select Supplier";
            document.getElementById('supplier-input-id').value = "";
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
            const docRef = await addDoc(collection(firestore, cupplierCol), data);
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

// filter
function filterStock(filterType) {
    const filteredData = allData.filter(item => {
        if (filterType === 'normal') {
            return item.quantity >= item.min && item.quantity <= item.max;
        } else if (filterType === 'low') {
            return item.quantity < item.min;
        } else if (filterType === 'over') {
            return item.quantity > item.max;
        } else {
            return true;
        }
    });

    updateTable(filteredData);
}

// Update table with filtered data
function updateTable(filteredData) {
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    filteredData.forEach(data => addToTable(data));
}
//===================================================//
//================Inventory Code End=================//
//===================================================//

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
            document.getElementById("forgot-password-btn")?.addEventListener("click", function() {
                loadContent("password.html");
            });
            document.getElementById("signup-btn")?.addEventListener("click", function() {
                loadContent("signup.html");
            }); 

            // show login password
            document.getElementById('toggle-password-btn')?.addEventListener('click', function () {
                const passwordInput = document.getElementById('login-password-input');
                const icon = document.getElementById('toggle-password-icon');
                
            
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });

            // show signup password
            document.getElementById('toggle-signup-password-btn')?.addEventListener('click', function () {
                const passwordSignupInput = document.getElementById('signup-password-input');
                const icon = document.getElementById('toggle-signup-password-btn');

                if (passwordSignupInput.type === 'password') {
                    passwordSignupInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordSignupInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });

            // Login page comfirm button
            document.getElementById('login-comfirm-btn')?.addEventListener('click', async () => {
                await checkUserLogin();
            });

            // Sign up page comfirm button
            document.getElementById('signup-comfirm-btn')?.addEventListener('click', async () => {
                await getSignupInputData();
            });
            // Google sign-up
            document.getElementById('google-signup-btn')?.addEventListener('click', function() {
                signInWithPopup(auth, provider)
                    .then((result) => {
                        // Signed in successfully
                        const user = result.user;
                        loadContent('inventory.html');
                    })
                    .catch((error) => {
                        // Handle Errors here
                        console.error("Error during Google Sign-In: ", error.message);
                    });
            });

            // Reset password comfirm button
            document.getElementById('password-comfirm-btn')?.addEventListener('click', async () => {
                await resetPassword();
            });

            // Inventory page comfirm button
            document.getElementById('inventory-comfirm-btn')?.addEventListener('click', async () => {
                await saveInputData();
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

            // Inventory filter
            document.getElementById('allItemBtn')?.addEventListener('click', () => {
                filterStock('all');
            });
            document.getElementById('normalBtn')?.addEventListener('click', () => {
                filterStock('normal');
            });
            document.getElementById('lowBtn')?.addEventListener('click', () => {
                filterStock('low');
            });
            document.getElementById('overBtn')?.addEventListener('click', () => {
                filterStock('over');
            });

            // Inventory export data to excel file
            document.getElementById('exportBtn')?.addEventListener('click', function () {
                const table = document.querySelector('.data-table');
                const rows = Array.from(table.querySelectorAll('tbody tr'));
            
                const headers = ["NO.", "Name", "Price (RM)", "Quantity", "Barcode", "Supplier Name", "Supplier Contact", "Date Updated", "Updated By", "Description"];
            
                const dataToExport = rows.map(row => {
                    const cells = row.querySelectorAll('td');
            
                    return {
                        "NO.": cells[0]?.innerText.trim(),
                        "Name": cells[1]?.innerText.trim(),
                        "Price (RM)": cells[2]?.innerText.trim(),
                        "Quantity": cells[3]?.innerText.trim(),
                        "Barcode": cells[4]?.innerText.trim(),
                        "Supplier Name": cells[5]?.innerText.trim(),
                        "Supplier Contact": cells[6]?.innerText.trim(),
                        "Date Updated": cells[7]?.innerText.trim(),
                        "Updated By": cells[8]?.innerText.trim(),
                        "Description": cells[9]?.innerText.trim()
                    };
                });
            
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
            
                XLSX.utils.book_append_sheet(wb, ws, "Inventory Data");
                XLSX.writeFile(wb, "Inventory_Export_"+ getDate() +".xlsx");
            });

            if (typeof callback === 'function') {
                callback();
            } 

        })
        .catch(error => console.error('Error loading content:', error));
}
 
if (window.location.pathname.includes("main.html")) {
    loadContent('home.html');
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
})(jQuery);

