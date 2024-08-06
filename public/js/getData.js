let currentId = 1;
let dataRows = [];

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

function loadData() {
    const storedData = JSON.parse(localStorage.getItem('dataRows')) || [];
    dataRows = storedData;
    currentId = dataRows.length ? dataRows[dataRows.length - 1].id + 1 : 1;
    
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    dataRows.forEach(data => addToTable(data));
}

function addToTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const newRow = document.createElement('tr');

    if(data.dateReturn === ""){
        data.dateReturn = `<button onclick="returnData(${data.id})" class="btn btn-primary">Return</button>`;
    }

    newRow.innerHTML = `
        <td><span><button onclick="editData(${data.id})" class="btn btn-primary" style="margin:5px;"><i class="fa-solid fa-pen fa-lg" style="color: #ffffff;"></i></button><button onclick="deleteData(${data.id})" class="btn btn-primary" style="background-color:#d73200;"><i class="fa-regular fa-trash-can fa-lg" style="color: #ffffff;"></i></button></span></td>
        <td>${data.id}</td>
        <td>${data.name}</td>
        <td>${data.item}</td>
        <td>${data.dateBorrow}</td>
        <td>${data.dateExpectedReturn}</td>
        <td>${data.dateReturn}</td>
        <td>${data.remarks}</td>
    `;
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }
}

//clear the input
function resetInput(){
    document.getElementById('comfirm-btn').style.display = 'block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';

    document.getElementById('name-input').value = "";
    document.getElementById('item-input').value = "";
    document.getElementById('date-input').value = "";
    document.getElementById('remarks-input').value = "";
}

function getInputData() {
    const name = document.getElementById('name-input').value;
    const item = document.getElementById('item-input').value;
    const dateBorrow = getDate();
    const dateReturn = "";
    const dateExpectedReturn = document.getElementById('date-input').value;
    const remarks = document.getElementById('remarks-input').value;

    if (name && item && dateExpectedReturn) {
        const data = { id: currentId, name, item, dateBorrow, dateExpectedReturn, dateReturn, remarks };
        dataRows.push(data);
        localStorage.setItem('dataRows', JSON.stringify(dataRows));
        addToTable(data);
        currentId++;
        resetInput()
    } else {
        alert('Please fill out all required fields.');
    }
}

function returnData(id) {
    // Find index of data object with given id
    const index = dataRows.findIndex(data => data.id === id);
    if (index === -1) {
        console.error(`Data with id ${id} not found.`);
        return;
    }

    dataRows[index].dateReturn = getDate();

    // Find and update the corresponding row in the table
    const tableBody = document.getElementById('data-table-body');
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent); // Assuming id is in the second column
        if (rowId === id) {
            rows[i].getElementsByTagName('td')[6].textContent = dataRows[index].dateReturn;
            break;
        }
    }
    updateLocalStorage()
}

function deleteData(id) {
    const isConfirmed = confirm("Are you sure you want to delete this?");
    if (isConfirmed) {
        resetInput();
        // Find index of data object with given id
        const index = dataRows.findIndex(data => data.id === id);
        if (index !== -1) {
            // Remove data object from array
            dataRows.splice(index, 1);
            // Update localStorage
            updateLocalStorage()
            // Remove row from table
            const tableBody = document.getElementById('data-table-body');
            tableBody.innerHTML = '';
            dataRows.forEach(data => addToTable(data)); // Re-add rows
        }
    }
}

function editData(id) {
    document.getElementById('comfirm-btn').style.display = 'none';
    document.getElementById('save-btn').style.display = 'block';
    document.getElementById('cancel-btn').style.display = 'block';

    const dataToEdit = dataRows.find(data => data.id === id);
    if (!dataToEdit) {
        console.error(`Data with id ${id} not found.`);
        return;
    }

    // Find the row element to highlight
    const tableBody = document.getElementById('data-table-body');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        rows[i].style.backgroundColor = '';
    }

    let rowToHighlight = null;
    for (let i = 0; i < rows.length; i++) {
        const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent); // Assuming id is in the second column
        if (rowId === id) {
            rowToHighlight = rows[i];
            break;
        }
    }

    // Add the highlight class to the row
    if (rowToHighlight) {
        rowToHighlight.style.backgroundColor = '#677e8a17';
    }

    // write the data into the input box
    document.getElementById('name-input').value = dataToEdit.name;
    document.getElementById('item-input').value = dataToEdit.item;
    document.getElementById('date-input').value = dataToEdit.dateExpectedReturn;
    document.getElementById('remarks-input').value = dataToEdit.remarks;

    document.getElementById('save-btn').onclick = function() {
        //get the data from input
        const editedName = document.getElementById('name-input').value;
        const editedItem = document.getElementById('item-input').value;
        const editedDate = document.getElementById('date-input').value;
        const editedRemarks = document.getElementById('remarks-input').value;

        dataToEdit.name = editedName;
        dataToEdit.item = editedItem;
        dataToEdit.dateExpectedReturn = editedDate;
        dataToEdit.remarks = editedRemarks;
        
        updateTableRow(dataToEdit);

        //update the local storage
        updateLocalStorage()

        //clear the input
        resetInput()

        if (rowToHighlight) {
            rowToHighlight.style.backgroundColor = '';
        }
    };

    document.getElementById('cancel-btn').onclick = function() {
        //clear the input
        resetInput()

        if (rowToHighlight) {
            rowToHighlight.style.backgroundColor = '';
        }
    };
}

//update ui table's data
function updateTableRow(data) {
    const tableBody = document.getElementById('data-table-body');
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const rowId = parseInt(rows[i].getElementsByTagName('td')[1].textContent); // Assuming id is in the second column
        if (rowId === data.id) {
            rows[i].getElementsByTagName('td')[2].textContent = data.name;
            rows[i].getElementsByTagName('td')[3].textContent = data.item;
            rows[i].getElementsByTagName('td')[5].textContent = data.dateExpectedReturn;
            rows[i].getElementsByTagName('td')[7].textContent = data.remarks;
            break;
        }
    }
}

// update the local storage with new data in table
function updateLocalStorage(){
    localStorage.setItem('dataRows', JSON.stringify(dataRows));
}

// search
document.getElementById('searchInput').addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    const filteredData = dataRows.filter(data => {
        return (
            data.id.toString().toLowerCase().includes(searchValue) ||
            data.name.toLowerCase().includes(searchValue) ||
            data.item.toLowerCase().includes(searchValue) ||
            data.dateReturn.toLowerCase().includes(searchValue) ||
            (data.dateBorrow && data.dateBorrow.toLowerCase().includes(searchValue)) ||
            (data.dateExpectedReturn && data.dateExpectedReturn.toLowerCase().includes(searchValue)) ||
            (data.dateReturn && data.dateReturn.toLowerCase().includes(searchValue)) ||
            (data.remarks && data.remarks.toLowerCase().includes(searchValue))
        );
    });
    document.getElementById('data-table-body').innerHTML = '';
    filteredData.forEach(data => addToTable(data));
});

// filter
document.getElementById('allUserBtn').addEventListener('click', function() {
    loadData()
});
document.getElementById('noReturnBtn').addEventListener('click', function() {
    const filteredData = dataRows.filter(data => {
        return (
            (data.dateReturn && data.dateReturn.toLowerCase().includes("button"))
        );
    });
    document.getElementById('data-table-body').innerHTML = '';
    filteredData.forEach(data => addToTable(data));
});
document.getElementById('returnedBtn').addEventListener('click', function() {
    const filteredData = dataRows.filter(data => {
        return (
            !(data.dateReturn && data.dateReturn.toLowerCase().includes("button"))
        );
    });
    document.getElementById('data-table-body').innerHTML = '';
    filteredData.forEach(data => addToTable(data));
});

// clear all data
document.getElementById('clearBtn').addEventListener('click', function() {
    let modal = document.getElementById('passwordPromptModal');
    let closeBtn = document.getElementById('closeBtn');
    let confirmBtn = document.getElementById('confirmPasswordBtn');
    const tableBody = document.getElementById('data-table-body');

    // show modal
    modal.style.display = 'block';

    // close the modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // validate the password
    confirmBtn.onclick = function() {
        let password = document.getElementById('passwordInput').value;
        if (password === '008989') {
            let confirmation = confirm("Are you sure you want to clear all data?");
            if(confirmation){
                dataRows = [];
                updateLocalStorage();            
                tableBody.innerHTML = '';
                modal.style.display = 'none';
                password.value='';
                alert("Data cleared successfully.");
            }
        } else {
            // show error message
            alert("Incorrect password. Please enter again.");
        }
    };

    // close the modal if the user clicks outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});

document.getElementById('exportBtn').addEventListener('click', function(){
    // Create a new data array with modified values
    const modifiedDataRows = dataRows.map(row => {
        const newRow = { ...row };
        for (let key in newRow) {
            if (typeof newRow[key] === 'string' && newRow[key].includes("button")) {
                newRow[key] = "Not returned";
            }
        }
        return newRow;
    });

    const headers = Object.keys(modifiedDataRows[0]);
    const upperCaseHeaders = headers.map(header => header.toUpperCase());

    const dataWithUpperCaseHeaders = modifiedDataRows.map(row => {
        const newRow = {};
        headers.forEach((header, index) => {
            newRow[upperCaseHeaders[index]] = row[header];
        });
        return newRow;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataWithUpperCaseHeaders, { header: upperCaseHeaders });
    
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "Robot_Inventory.xlsx");
});

window.onload = loadData;