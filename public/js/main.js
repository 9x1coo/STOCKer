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

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-content').innerHTML = data;

            // Load login page
            document.getElementById("login-btn")?.addEventListener("click", function() {
                loadContent("login.html");
            });

            document.getElementById("login-start-btn")?.addEventListener("click", function() {
                loadContent("login.html");
            });

            document.getElementById("signup-btn")?.addEventListener("click", function() {
                loadContent("signup.html");
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

// Load home page by default if on main.html
if (window.location.pathname.includes("main.html")) {
    loadContent('inventory.html'); 
}

// document.getElementById("login-start-btn").addEventListener("click", function() {
//     loadContent("login.html");
// });

