let datas = [];
const schools = new Set();
const departmentsMap = {};
const professorsMap = {};

// Show the loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'block';
    console.log('open spin.')
}

// Hide the loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
    console.log('close spin.')
}

async function loadExcel() {
    console.log('start loading.')
    showLoading();  // Show the loading screen
    try {
    const file = '导师评价20240229更新.xlsx'; // Replace with your actual file path
    const response = await fetch(file);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    datas = jsonData.map(item => {
        const school = item['学校'];
        const department = item['专业'];
        const professor = item['姓名'];
        const review = item['评价'];
        const score = item['SnowNLP的情感打分（0-1）仅供参考'];

        // Add to sets for auto-complete
        schools.add(school);

        // Map departments to schools
        if (!departmentsMap[school]) {
            departmentsMap[school] = new Set();
        }
        departmentsMap[school].add(department);

        // Map professors to departments
        if (!professorsMap[department]) {
            professorsMap[department] = new Set();
        }
        professorsMap[department].add(professor);

        return { school, department, professor, review, score };
    });

    updateSchoolDatalist();
    } catch (error) {
    console.error('Error loading the Excel file:', error);
    alert('Error loading the Excel file: ' + error.message);
} finally {
    hideLoading();  // Hide the loading screen
}
}

function updateSchoolDatalist() {
    const schoolDatalist = document.getElementById('schools') || document.createElement('datalist');
    schoolDatalist.id = 'schools';
    schoolDatalist.innerHTML = '';

    schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        schoolDatalist.appendChild(option);
    });

    document.body.appendChild(schoolDatalist);
}

function updateDepartments() {
    const schoolInput = document.getElementById('school-input').value;
    const departmentInput = document.getElementById('department-input');
    departmentInput.value = '';
    departmentInput.placeholder = 'Enter Department Name';
    const departmentDatalist = document.getElementById('departments') || document.createElement('datalist');
    departmentDatalist.id = 'departments';
    departmentDatalist.innerHTML = '';

    if (departmentsMap[schoolInput]) {
        departmentsMap[schoolInput].forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            departmentDatalist.appendChild(option);
        });
    }

    document.body.appendChild(departmentDatalist);
    updateProfessors(); // Clear the professors when changing school or department
}

function updateDepartments_new() {
    const schoolInput = document.getElementById('school-input').value;
    const departmentInput = document.getElementById('department-input');
    departmentInput.value = '';
    departmentInput.placeholder = 'Enter Department Name';
    const departmentDatalist = document.getElementById('departments') || document.createElement('datalist');
    departmentDatalist.id = 'departments';
    departmentDatalist.innerHTML = '';

    const professorInput = document.getElementById('professor-input');
    professorInput.value = '';
    professorInput.placeholder = 'Enter Professor Name';
    const professorDatalist = document.getElementById('professors') || document.createElement('datalist');
    professorDatalist.id = 'professors';
    professorDatalist.innerHTML = '';

    if (departmentsMap[schoolInput]) {
        departmentsMap[schoolInput].forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            departmentDatalist.appendChild(option);
        });

        // Also update professors based on the selected school
        const professors = new Set();
        departmentsMap[schoolInput].forEach(department => {
            if (professorsMap[department]) {
                professorsMap[department].forEach(professor => {
                    professors.add(professor);
                });
            }
        });

        professors.forEach(professor => {
            const option = document.createElement('option');
            option.value = professor;
            professorDatalist.appendChild(option);
        });
    }

    document.body.appendChild(departmentDatalist);
    document.body.appendChild(professorDatalist);
}

function updateProfessors() {
    const departmentInput = document.getElementById('department-input').value;
    const professorInput = document.getElementById('professor-input');
    professorInput.value = '';
    professorInput.placeholder = 'Enter Professor Name';
    const professorDatalist = document.getElementById('professors') || document.createElement('datalist');
    professorDatalist.id = 'professors';
    professorDatalist.innerHTML = '';

    if (professorsMap[departmentInput]) {
        professorsMap[departmentInput].forEach(professor => {
            const option = document.createElement('option');
            option.value = professor;
            professorDatalist.appendChild(option);
        });
    }

    document.body.appendChild(professorDatalist);
}

function search() {
    const schoolInput = document.getElementById('school-input').value;
    const departmentInput = document.getElementById('department-input').value;
    const professorInput = document.getElementById('professor-input').value;
    const results = datas.filter(item =>
        item.school.includes(schoolInput) &&
        item.department.includes(departmentInput) &&
        item.professor.includes(professorInput)
    );

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <h3>${result.professor} - ${result.school}</h3>
                <p>${result.department}</p>
                <p>${result.review}</p>
                <p><strong>Sentiment Score:</strong> ${result.score}</p>
            `;
            resultsDiv.appendChild(resultItem);
        });
    }
}

// loadExcel();

// loadExcel();  # 这样调用不合理
// Call loadExcel() when the page loads or when needed
window.onload = async function() {
    await loadExcel();
};
