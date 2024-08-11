let datas = [];
const schools = new Set();
const professors = new Set();

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

    // Process data into a format suitable for the search
    datas = jsonData.map(item => {
        const school = item['学校'];
        const department = item['专业'];
        const professor = item['姓名'];
        const review = item['评价'];
        const score = item['SnowNLP的情感打分（0-1）仅供参考'];

        // Add to sets for auto-complete
        schools.add(school);
        professors.add(professor);

        return { school, department, professor, review, score };
    });

    // Create lists for auto-complete
    const schoolDatalist = document.createElement('datalist');
    const professorDatalist = document.createElement('datalist');
    schoolDatalist.id = 'schools';
    professorDatalist.id = 'professors';

    schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        schoolDatalist.appendChild(option);
    });

    professors.forEach(professor => {
        const option = document.createElement('option');
        option.value = professor;
        professorDatalist.appendChild(option);
    });

    document.body.appendChild(schoolDatalist);
    document.body.appendChild(professorDatalist);
    console.log('loaded OK.')
    } catch (error) {
    console.error('Error loading the Excel file:', error);
    alert('Error loading the Excel file: ' + error.message);
} finally {
    hideLoading();  // Hide the loading screen
}
}

// loadExcel();  # 这样调用不合理
// Call loadExcel() when the page loads or when needed
window.onload = async function() {
    await loadExcel();
};

function search() {
    const schoolInput = document.getElementById('school-input').value;
    const professorInput = document.getElementById('professor-input').value;
    const results = datas.filter(item =>
        item.school.includes(schoolInput) && item.professor.includes(professorInput)
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
