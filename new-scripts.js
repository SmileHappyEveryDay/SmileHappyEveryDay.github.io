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

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function searchFromURL() {
    const tutorName = getUrlParameter('tutor');
    console.log(tutorName)
    if (tutorName) {
        document.getElementById('professor-input').value = tutorName;
        const matchedTutor = datas.find(item => item.professor === tutorName);
        if (matchedTutor) {
            search();  // Perform the search and display results
        } else {
            alert('Tutor ' + tutorName + ' not found');
        }
    }
    else
    {
        document.getElementById('professor-input').value = '骆祥峰';
        search();
    }
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
        const score = item['SnowNLP的情感打分(0-1)仅供参考'];

        // Add to sets for auto-complete
        schools.add(school);

        // Map departments to schools
        if (!departmentsMap[school]) {
            departmentsMap[school] = new Set();
        }
        departmentsMap[school].add(department);

        // Map professors to departments
        if (!professorsMap[school]) {
            professorsMap[school] = {};
        }
        if (!professorsMap[school][department]) {
                professorsMap[school][department] = new Set();
            }
            professorsMap[school][department].add(professor);

        return { school, department, professor, review, score };
    });

    updateSchoolDatalist();
    searchFromURL();  // <- Add this line to trigger the search based on URL parameter
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

// function updateDepartments() {
//     const schoolInput = document.getElementById('school-input').value;
//     const departmentInput = document.getElementById('department-input');
//     departmentInput.value = '';
//     departmentInput.placeholder = 'Enter Department Name';
//     const departmentDatalist = document.getElementById('departments') || document.createElement('datalist');
//     departmentDatalist.id = 'departments';
//     departmentDatalist.innerHTML = '';
//
//     if (departmentsMap[schoolInput]) {
//         departmentsMap[schoolInput].forEach(department => {
//             const option = document.createElement('option');
//             option.value = department;
//             departmentDatalist.appendChild(option);
//         });
//     }
//
//     document.body.appendChild(departmentDatalist);
//     updateProfessors(); // Clear the professors when changing school or department
// }

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

        // // Also update professors based on the selected school
        // const professors = new Set();
        // departmentsMap[schoolInput].forEach(department => {
        //     if (professorsMap[department]) {
        //         professorsMap[department].forEach(professor => {
        //             professors.add(professor);
        //         });
        //     }
        // });

        // Also update professors based on the selected school and department
        const professors = new Set();
        departmentsMap[schoolInput].forEach(department => {
            if (professorsMap[schoolInput][department]) {
                professorsMap[schoolInput][department].forEach(professor => {
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
    const schoolInput = document.getElementById('school-input').value;
    const departmentInput = document.getElementById('department-input').value;
    const professorInput = document.getElementById('professor-input');
    professorInput.value = '';
    professorInput.placeholder = 'Enter Professor Name';
    const professorDatalist = document.getElementById('professors') || document.createElement('datalist');
    professorDatalist.id = 'professors';
    professorDatalist.innerHTML = '';

    // if (professorsMap[departmentInput]) {
    //     professorsMap[departmentInput].forEach(professor => {
    //         const option = document.createElement('option');
    //         option.value = professor;
    //         professorDatalist.appendChild(option);
    //     });
    // }

    if (professorsMap[schoolInput] && professorsMap[schoolInput][departmentInput]) {
        professorsMap[schoolInput][departmentInput].forEach(professor => {
            const option = document.createElement('option');
            option.value = professor;
            professorDatalist.appendChild(option);
        });
    }

    document.body.appendChild(professorDatalist);
}

function convertScoreToStars(score) {
    const maxStars = 5;
    const scaledScore = Math.round(score * maxStars);
    let starsHTML = '';

    for (let i = 0; i < maxStars; i++) {
        if (i < scaledScore) {
            starsHTML += '<span class="star full"></span>';
        } else {
            starsHTML += '<span class="star empty"></span>';
        }
    }

    // return `<div class="star-rating">${starsHTML}</div>`;

    return `<span class="star-rating">
                ${starsHTML}
            </span>`;
}

function search() {
    const schoolInput = document.getElementById('school-input').value.trim();
    const departmentInput = document.getElementById('department-input').value.trim();
    const professorInput = document.getElementById('professor-input').value.trim();
    // 检查是否至少输入了一项
    if (!schoolInput && !departmentInput && !professorInput) {
        alert('请至少输入一项');
        return;
    }
    const results = datas.filter(item =>
        item.school.includes(schoolInput) &&
        item.department.includes(departmentInput) &&
        item.professor.includes(professorInput)
    );

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    const tooltip = 'AI文本情感评测模型预测值，存在一定误差（满分：五星）';
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        results.forEach(result => {
            const starsHTML = convertScoreToStars(result.score);
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <h3>${result.professor} - ${result.school}</h3>
                <p>${result.department}</p>
                <p>${result.review}</p>
                <!-- <span>${tooltip}</span> -->
                <p style="font-size: 14px; font-weight: bold; color: #5DADE2;">${tooltip}</p>
                <p><strong>Sentiment Score:</strong> ${result.score} ${starsHTML}
                </p>
                
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
