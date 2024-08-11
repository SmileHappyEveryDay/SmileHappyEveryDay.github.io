const exampledata = [
    {
        "school": "齐鲁工业大学",
        "department": "电气工程与自动化学院",
        "professor": "张芳芳",
        "review": "导师辨识特征: 电气学院为数不多的几个学术搞得好...",
        "score": 0.996804148
    },
    // Add more entries here
];

// Create lists for auto-complete
const exschools = [...new Set(exampledata.map(item => item.school))];
const exprofessors = [...new Set(exampledata.map(item => item.professor))];

// Insert the options into the datalist for auto-suggestion
window.onload = function() {
    const schoolInput = document.getElementById('school-input');
    const professorInput = document.getElementById('professor-input');
    const schoolDatalist = document.createElement('datalist');
    const professorDatalist = document.createElement('datalist');
    schoolDatalist.id = 'schools';
    professorDatalist.id = 'professors';

    exschools.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        schoolDatalist.appendChild(option);
    });

    exprofessors.forEach(professor => {
        const option = document.createElement('option');
        option.value = professor;
        professorDatalist.appendChild(option);
    });

    document.body.appendChild(schoolDatalist);
    document.body.appendChild(professorDatalist);
};
