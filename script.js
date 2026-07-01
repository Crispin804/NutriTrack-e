// global variables
let loggedFoods = [];

// dom element selectors
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodCaloriesInput = document.getElementById('food-calories');
const foodList = document.getElementById('food-list');
const totalCaloriesDisplay = document.getElementById('total-calories');
const resetBtn = document.getElementById('reset-btn');
const emptyState = document.getElementById('empty-state');
const fetchSuggestionsBtn = document.getElementById('fetch-suggestions-btn');
const suggestionsContainer = document.getElementById('suggestions-container');

// app initialization
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    renderApp();
});

// load data from storage
function loadDataFromStorage() {
    const savedData = localStorage.getItem('nutriTrackFoods');
    if (savedData) {
        try {
            loggedFoods = JSON.parse(savedData);
        } catch (e) {
            console.error("Storage corrupted, resetting data.", e);
            loggedFoods = [];
        }
    }
}

// update state and storage
function updateStateAndStorage() {
    localStorage.setItem('nutriTrackFoods', JSON.stringify(loggedFoods));
    renderApp();
}

// render app
function renderApp() {
    foodList.innerHTML = '';
    let totalCalories = 0;

    if (loggedFoods.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        loggedFoods.forEach(item => {
            totalCalories += item.calories;
            
            const li = document.createElement('li');
            li.className = "py-3 flex justify-between items-center group hover:bg-gray-50 px-2 rounded-lg transition duration-150";
            li.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="font-medium text-gray-700">${item.name}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full text-sm">${item.calories} kcal</span>
                    <button onclick="removeFoodItem('${item.id}')" class="text-gray-400 hover:text-red-500 transition duration-150" title="Delete entry">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            foodList.appendChild(li);
        });
    }
    
    totalCaloriesDisplay.textContent = totalCalories;
}

// food form event listener
foodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = foodNameInput.value.trim();
    const calories = parseInt(foodCaloriesInput.value, 10);
    
    if (!name || isNaN(calories) || calories <= 0) return;

    const newFood = {
        id: Date.now().toString(),
        name: name,
        calories: calories
    };

    loggedFoods.push(newFood);
    updateStateAndStorage();
    
    foodForm.reset();
    foodNameInput.focus();
});

// remove food item
window.removeFoodItem = function(id) {
    loggedFoods = loggedFoods.filter(item => item.id !== id);
    updateStateAndStorage();
};

// reset button event listener
resetBtn.addEventListener('click', () => {
    if (loggedFoods.length === 0) return;
    
    if (confirm('Are you sure you want to clear all data logs for today?')) {
        loggedFoods = [];
        updateStateAndStorage();
    }
});

// fetch suggestions event listener
fetchSuggestionsBtn.addEventListener('click', async () => {
    fetchSuggestionsBtn.disabled = true;
    fetchSuggestionsBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Fetching...`;
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
        if (!response.ok) throw new Error('Network issue');
        const data = await response.json();
        
        const standardFoods = [
            { name: "Greek Yogurt Bowl", calories: 180 },
            { name: "Grilled Chicken Salad", calories: 350 },
            { name: "Protein Shake", calories: 220 },
            { name: "Almonds (Handful)", calories: 160 }
        ];

        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('hidden');

        data.forEach((_, index) => {
            const foodItem = standardFoods[index] || { name: "Apple", calories: 95 };
            
            const div = document.createElement('div');
            div.className = "flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 transition text-xs";
            div.innerHTML = `
                <span class="text-gray-700 font-medium">${foodItem.name} (${foodItem.calories} kcal)</span>
                <button type="button" onclick="quickAdd('${foodItem.name}', ${foodItem.calories})" class="text-blue-500 hover:text-blue-700 font-bold">
                    <i class="fa-solid fa-circle-plus"></i> Use
                </button>
            `;
            suggestionsContainer.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        suggestionsContainer.innerHTML = `<p class="text-red-500 text-xs">Failed to gather data ideas. Please check connection.</p>`;
        suggestionsContainer.classList.remove('hidden');
    } finally {
        fetchSuggestionsBtn.disabled = false;
        fetchSuggestionsBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Load Ideas`;
    }
});

// quick add function
window.quickAdd = function(name, calories) {
    const quickFood = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: name,
        calories: parseInt(calories, 10)
    };
    loggedFoods.push(quickFood);
    updateStateAndStorage();
};