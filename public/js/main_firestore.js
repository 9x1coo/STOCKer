// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
// import {query, getFirestore, doc, setDoc, collection, getDocs, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// let currentUserId = 1;
// let dataRows = [];

// const firebaseApp = initializeApp({
//     apiKey: "AIzaSyA7TsXEByLxZLuPga32MlbBzI92zSXpelY",
//     authDomain: "stocker-83325.firebaseapp.com",
//     projectId: "stocker-83325",
//     storageBucket: "stocker-83325.firebasestorage.app",
//     messagingSenderId: "364662570826",
//     appId: "1:364662570826:web:e5ae09dcc83d81acc24bb3",
//     measurementId: "G-ZMLHCEF9H3"
// });

// const firestore = getFirestore(firebaseApp);


// //get the current date time
// function getDate(){
//     const now = new Date();

//     const pad = (num) => (num < 10 ? '0' : '') + num;

//     const year = now.getFullYear(); 
//     const month = pad(now.getMonth() + 1);
//     const date = pad(now.getDate()); 
//     const hours = pad(now.getHours()); 
//     const minutes = pad(now.getMinutes()); 
//     const seconds = pad(now.getSeconds()); 

//     const formattedDateTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

//     return formattedDateTime;
// }

// //clear the input
// function resetInput(){
//   document.getElementById('comfirm-btn').style.display = 'block';
//   document.getElementById('save-btn').style.display = 'none';
//   document.getElementById('cancel-btn').style.display = 'none';
//   document.getElementById('itemPhotoImg').style.display = 'none';

//   document.getElementById('name-input').value = "";
//   document.getElementById('item-input').value = "";
//   document.getElementById('date-input').value = "";
//   document.getElementById('remarks-input').value = "";
//   document.getElementById('photo-input-url').value = "";
// }

// //display the data in the table
// function addToTable(data) {
//   const tableBody = document.getElementById('data-table-body');
//   const newRow = document.createElement('tr');

//   if(data.dateReturn === ""){
//       data.dateReturn = `<button data-id="${data.id}" class="btn btn-primary return-btn">Return</button>`;
//   }

//   const itemPhotoHtml = data.itemPhoto ? `<img src="${data.itemPhoto}" alt="Item Photo" width="200" height="200">` : '';

//   newRow.innerHTML = `
//       <td><span><button data-id="${data.id}" class="btn btn-primary edit-btn" style="margin:5px;"><i class="fa-solid fa-pen fa-lg" style="color: #ffffff;"></i></button><button data-id="${data.id}" class="btn btn-primary delete-btn" style="background-color:#d73200;"><i class="fa-regular fa-trash-can fa-lg" style="color: #ffffff;"></i></button></span></td>
//       <td>${data.id}</td>
//       <td>${data.name}</td>
//       <td>${data.item}<br>${itemPhotoHtml}</td>
//       <td>${data.dateBorrow}</td>
//       <td>${data.dateExpectedReturn}</td>
//       <td>${data.dateReturn}</td>
//       <td>${data.remarks}</td>
//   `;
//   if (tableBody.firstChild) {
//       tableBody.insertBefore(newRow, tableBody.firstChild);
//   } else {
//       tableBody.appendChild(newRow);
//   }
// }

// //load the data from firestore to the table
// async function loadData() {
//   const dataRowsCollection = query(collection(firestore, 'dataRows'), orderBy("id", "asc"));
//   const querySnapshot = await getDocs(dataRowsCollection);
  
//   dataRows = [];
  
//   querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       data.id = doc.id; 
//       dataRows.push(data);
//   });
  
//   currentId = dataRows.length ? parseInt(dataRows[dataRows.length - 1].id) + 1 : 1;
  
//   const tableBody = document.getElementById('data-table-body');
//   tableBody.innerHTML = '';
//   dataRows.forEach(data => addToTable(data));
// }

// //take photo
// document.getElementById('photo-btn').addEventListener('click', function() {
//     document.getElementById('take-photo-input').click();
// });
// document.getElementById('take-photo-input').addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const dataUrl = e.target.result;
//             const img = new Image();

//             img.onload = function() {
//                 const canvas = document.createElement('canvas');
//                 const ctx = canvas.getContext('2d');

//                 // Set canvas dimensions
//                 const MAX_WIDTH = 200; 
//                 const MAX_HEIGHT = 200;
//                 let width = img.width;
//                 let height = img.height;

//                 // Preserving aspect ratio
//                 if (width > height) {
//                     if (width > MAX_WIDTH) {
//                         height *= MAX_WIDTH / width;
//                         width = MAX_WIDTH;
//                     }
//                 } else {
//                     if (height > MAX_HEIGHT) {
//                         width *= MAX_HEIGHT / height;
//                         height = MAX_HEIGHT;
//                     }
//                 }

//                 canvas.width = width;
//                 canvas.height = height;

//                 ctx.drawImage(img, 0, 0, width, height); //canvas cannot accept dataUrl

//                 // Compress the image
//                 const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); 

//                 const camera = document.getElementById('itemPhotoImg');
//                 camera.src = compressedDataUrl;
//                 camera.style.display = 'block';
//                 document.getElementById('photo-input-url').value = compressedDataUrl;
//             };
//             img.src = dataUrl;
//         };
//         reader.readAsDataURL(file);
//     }
// });

// //get data from input
// document.getElementById('comfirm-btn').addEventListener('click', async () => {
//   await getInputData();
// });
// async function getInputData() {
//   const name = document.getElementById('name-input').value;
//   const item = document.getElementById('item-input').value;
//   const itemPhoto = document.getElementById('photo-input-url').value;
//   const dateBorrow = getDate();
//   const dateReturn = "";
//   const dateExpectedReturn = document.getElementById('date-input').value;
//   const remarks = document.getElementById('remarks-input').value;

//   if (name && item && dateExpectedReturn) {
//       const data = { id: currentId, name, item, itemPhoto, dateBorrow, dateExpectedReturn, dateReturn, remarks };
//       const docRef = doc(firestore, 'dataRows', String(currentId));
//       await setDoc(docRef, data);
//       dataRows.push(data);
//       addToTable(data);
//       currentId++;
//       resetInput();
//   } else {
//       alert('Please fill out all required fields.');
//   }
// }

// //event listener for edit delete return
// document.addEventListener('DOMContentLoaded', (event) => {
//   document.getElementById('data-table-body').addEventListener('click', async (e) => {
//       if (e.target.closest('.return-btn')) {
//           const id = e.target.closest('.return-btn').getAttribute('data-id');
//           await returnData(parseInt(id));
//       } else if (e.target.closest('.edit-btn')) {
//           const id = e.target.closest('.edit-btn').getAttribute('data-id');
//           editData(parseInt(id));
//       } else if (e.target.closest('.delete-btn')) {
//           const id = e.target.closest('.delete-btn').getAttribute('data-id');
//           deleteData(parseInt(id));
//       }
//   });
// });

// //return item's date
// async function returnData(id) {
//   const data = dataRows.find(data => String(data.id) === String(id));
//   if (!data) {
//       console.error(`Data with id ${id} not found.`);
//       return;
//   }

//   data.dateReturn = getDate();

//   // Update Firestore
//   const docRef = doc(firestore, 'dataRows', String(id));
//   await updateDoc(docRef, { dateReturn: data.dateReturn });

//   const tableBody = document.getElementById('data-table-body');
//   const rows = tableBody.getElementsByTagName('tr');
//   for (let i = 0; i < rows.length; i++) {
//       const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent);
//       if (rowId === id) {
//           rows[i].getElementsByTagName('td')[6].textContent = data.dateReturn;
//           break;
//       }
//   }
// }

// //delete current row data
// async function deleteData(id) {
//   let modal = document.getElementById('passwordPromptModal');
//   let closeBtn = document.getElementById('closeBtn');
//   let confirmBtn = document.getElementById('confirmPasswordBtn');
//   const tableBody = document.getElementById('data-table-body');

//   // show modal
//   modal.style.display = 'block';

//   // close the modal
//   closeBtn.onclick = function() {
//       modal.style.display = 'none';
//   };

//   // validate the password
//   confirmBtn.onclick = async function() {
//       let password = document.getElementById('passwordInput').value;
//       if (password === '008989') {
//           let confirmation = confirm("Are you sure you want to delete this?");
//           if(confirmation){
//             try {
//                 resetInput();
//                 const index = dataRows.findIndex(data => String(data.id) === String(id));
//                 if (index !== -1) { 
//                         const docRef = doc(firestore, 'dataRows', String(id));
//                         await deleteDoc(docRef);
//                         dataRows.splice(index, 1);
//                         const tableBody = document.getElementById('data-table-body');
//                         tableBody.innerHTML = '';
//                         dataRows.forEach(data => addToTable(data));
//                 }

//                 // Close the modal and reset the password field
//                 document.getElementById('passwordInput').value = '';
//                 modal.style.display = 'none';

//                 alert("Data cleared successfully.");
//             } catch (error) {
//                 console.error("Error clearing data:", error);
//                 alert("An error occurred while clearing data. Please try again.");
//             }
//           }
//       } else {
//           // show error message
//           alert("Incorrect password. Please enter again.");
//       }
//   };

//   // close the modal if the user clicks outside of it
//   window.onclick = function(event) {
//       if (event.target == modal) {
//           modal.style.display = 'none';
//       }
//   };
// }

// //edit current row data
// async function editData(id) {
//   const dataToEdit = dataRows.find(data => String(data.id) === String(id));
//   if (!dataToEdit) {
//       console.error(`Data with id ${id} not found.`);
//       return;
//   }

//   document.getElementById('comfirm-btn').style.display = 'none';
//   document.getElementById('save-btn').style.display = 'block';
//   document.getElementById('cancel-btn').style.display = 'block';

//   const tableBody = document.getElementById('data-table-body');
//   const rows = tableBody.getElementsByTagName('tr');
//   let rowToHighlight = null;

//   for (let i = 0; i < rows.length; i++) {
//       rows[i].style.backgroundColor = '';
//       const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent);
//       if (rowId === id) {
//           rowToHighlight = rows[i];
//           break;
//       }
//   }

//   if (rowToHighlight) {
//       rowToHighlight.style.backgroundColor = '#677e8a17';
//   }

//   document.getElementById('name-input').value = dataToEdit.name;
//   document.getElementById('item-input').value = dataToEdit.item;
//   document.getElementById('photo-input-url').value = dataToEdit.itemPhoto;
//   document.getElementById('date-input').value = dataToEdit.dateExpectedReturn;
//   document.getElementById('remarks-input').value = dataToEdit.remarks;

//   document.getElementById('save-btn').onclick = async function() {
//       const editedName = document.getElementById('name-input').value;
//       const editedItem = document.getElementById('item-input').value;
//       const editedItemPhoto = document.getElementById('photo-input-url').value;
//       const editedDate = document.getElementById('date-input').value;
//       const editedRemarks = document.getElementById('remarks-input').value;

//       dataToEdit.name = editedName;
//       dataToEdit.item = editedItem;
//       dataToEdit.itemPhoto = editedItemPhoto;
//       dataToEdit.dateExpectedReturn = editedDate;
//       dataToEdit.remarks = editedRemarks;

//       updateTableRow(dataToEdit);
//       resetInput();

//       const docRef = doc(firestore, 'dataRows', String(id));
//       await updateDoc(docRef, dataToEdit);

//       if (rowToHighlight) {
//           rowToHighlight.style.backgroundColor = '';
//       }
//   };

//   document.getElementById('cancel-btn').onclick = function() {
//       resetInput();
//       if (rowToHighlight) {
//           rowToHighlight.style.backgroundColor = '';
//       }
//   };
// }

// //update ui table's data
// function updateTableRow(data) {
//     const tableBody = document.getElementById('data-table-body');
//     const rows = tableBody.getElementsByTagName('tr');
    
//     for (let i = 0; i < rows.length; i++) {
//         const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent); // Assuming id is in the second column
        
//         if (String(rowId) === String(data.id)) {
//             rows[i].getElementsByTagName('td')[2].textContent = data.name;
//             rows[i].getElementsByTagName('td')[3].innerHTML = `
//                 ${data.item}<br>
//                 <img src="${data.itemPhoto}" alt="Item Photo" width="200" height="200">
//             `;
//             rows[i].getElementsByTagName('td')[5].textContent = data.dateExpectedReturn;
//             rows[i].getElementsByTagName('td')[7].textContent = data.remarks;
//             break;
//         }
//     }
// }

// // clear all data
// document.getElementById('clearBtn').addEventListener('click', function() {
//   let modal = document.getElementById('passwordPromptModal');
//   let closeBtn = document.getElementById('closeBtn');
//   let confirmBtn = document.getElementById('confirmPasswordBtn');
//   const tableBody = document.getElementById('data-table-body');

//   // show modal
//   modal.style.display = 'block';

//   // close the modal
//   closeBtn.onclick = function() {
//       modal.style.display = 'none';
//   };

//   // validate the password
//   confirmBtn.onclick = async function() {
//       let password = document.getElementById('passwordInput').value;
//       if (password === '008989') {
//           let confirmation = confirm("Are you sure you want to clear all data?");
//           if(confirmation){
//             try {
//               // Clear dataRows array
//               dataRows = [];

//               // Clear all data from Firestore
//               const collectionRef = collection(firestore, 'dataRows');
//               const querySnapshot = await getDocs(collectionRef);
              
//               querySnapshot.forEach(async (doc) => {
//                   await deleteDoc(doc.ref);
//               });

//               // Update the UI
//               tableBody.innerHTML = '';

//               // Clear local storage if you use it
//               localStorage.removeItem('dataRows');

//               // Close the modal and reset the password field
//               document.getElementById('passwordInput').value = '';
//               modal.style.display = 'none';

//               alert("Data cleared successfully.");
//             } catch (error) {
//                 console.error("Error clearing data:", error);
//                 alert("An error occurred while clearing data. Please try again.");
//             }
//           }
//       } else {
//           // show error message
//           alert("Incorrect password. Please enter again.");
//       }
//   };

//   // close the modal if the user clicks outside of it
//   window.onclick = function(event) {
//       if (event.target == modal) {
//           modal.style.display = 'none';
//       }
//   };
// });

// // search
// document.getElementById('searchInput').addEventListener('input', function() {
//   const searchValue = this.value.toLowerCase();
//   const filteredData = dataRows.filter(data => {
//       return (
//           data.id.toString().toLowerCase().includes(searchValue) ||
//           data.name.toLowerCase().includes(searchValue) ||
//           data.item.toLowerCase().includes(searchValue) ||
//           data.dateReturn.toLowerCase().includes(searchValue) ||
//           (data.dateBorrow && data.dateBorrow.toLowerCase().includes(searchValue)) ||
//           (data.dateExpectedReturn && data.dateExpectedReturn.toLowerCase().includes(searchValue)) ||
//           (data.dateReturn && data.dateReturn.toLowerCase().includes(searchValue)) ||
//           (data.remarks && data.remarks.toLowerCase().includes(searchValue))
//       );
//   });
//   document.getElementById('data-table-body').innerHTML = '';
//   filteredData.forEach(data => addToTable(data));
// });

// // filter
// document.getElementById('allUserBtn').addEventListener('click', function() {
//   loadData()
// });
// document.getElementById('noReturnBtn').addEventListener('click', function() {
//   const filteredData = dataRows.filter(data => {
//       return (
//           (data.dateReturn && data.dateReturn.toLowerCase().includes("button"))
//       );
//   });
//   document.getElementById('data-table-body').innerHTML = '';
//   filteredData.forEach(data => addToTable(data));
// });
// document.getElementById('returnedBtn').addEventListener('click', function() {
//   const filteredData = dataRows.filter(data => {
//       return (
//           !(data.dateReturn && data.dateReturn.toLowerCase().includes("button"))
//       );
//   });
//   document.getElementById('data-table-body').innerHTML = '';
//   filteredData.forEach(data => addToTable(data));
// });

// //export data to excel file
// document.getElementById('exportBtn').addEventListener('click', function(){
//   const headers = ["ID", "NAME", "ITEM", "DATEBORROW", "DATEEXPECTEDRETURN", "DATERETURN", "REMARKS"];

//   const modifiedDataRows = dataRows.map(row => {
//       return {
//           ID: row.id,
//           NAME: row.name,
//           ITEM: row.item,
//           DATEBORROW: row.dateBorrow,
//           DATEEXPECTEDRETURN: row.dateExpectedReturn,
//           DATERETURN: typeof row.dateReturn === 'string' && row.dateReturn.includes("button") ? "Not returned" : row.dateReturn,
//           REMARKS: row.remarks
//       };
//   });

//   const wb = XLSX.utils.book_new();
//   const ws = XLSX.utils.json_to_sheet(modifiedDataRows, { header: headers });

//   XLSX.utils.book_append_sheet(wb, ws, "Data");
//   XLSX.writeFile(wb, "Robot_Inventory.xlsx");
// });

// window.onload = loadData;
