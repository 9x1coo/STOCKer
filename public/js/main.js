import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {query, getFirestore, doc, addDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// let currentUserId = 1;
let dataRows = [];
// let currentUser = null;

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
        document.getElementById('logout-btn').style.display = "block";
        document.getElementById('login-btn').style.display = "none";
        loadContent('inventory.html');
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
