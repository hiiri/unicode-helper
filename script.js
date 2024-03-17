const categoryDescriptions = {
    Ll: "Lowercase Letter",
    Lm: "Modifier Letter",
    Lo: "Other Letter",
    Lt: "Titlecase Letter",
    Lu: "Uppercase Letter",
    Mc: "Spacing Mark",
    Me: "Enclosing Mark",
    Mn: "Nonspacing Mark",
    Nd: "Decimal Number",
    Nl: "Letter Number",
    No: "Other Number",
    Pc: "Connector Punctuation",
    Pd: "Dash Punctuation",
    Pe: "Close Punctuation",
    Pf: "Final Punctuation",
    Pi: "Initial Punctuation",
    Po: "Other Punctuation",
    Ps: "Open Punctuation",
    Sc: "Currency Symbol",
    Sk: "Modifier Symbol",
    Sm: "Math Symbol",
    So: "Other Symbol",
    Zl: "Line Separator",
    Zp: "Paragraph Separator",
    Zs: "Space Separator",
    Cc: "Control",
    Cf: "Format",
    Cs: "Surrogate",
    Co: "Private Use",
    Cn: "Unassigned",
  };
  
document.addEventListener('DOMContentLoaded', async () => {
  const categories = {};
  try {
    const response = await fetch('UnicodeData.txt');
    const text = await response.text();
    const lines = text.split('\n');
    lines.forEach(line => {
      const fields = line.split(';');
      if (fields.length >= 3) {
        const code = parseInt(fields[0], 16);
        const category = fields[2];
        const char = String.fromCodePoint(code);
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(char);
      }
    });
    console.log(categories);
    setupCategoryFilters(categories);
    displayCategoryCharacters(Object.values(categories).flat());
  } catch (error) {
    console.error('Error fetching Unicode data:', error);
  }

  document.getElementById('inputText').addEventListener('input', function() {
    const input = this.value;
    const tbody = document.getElementById('characterDetails').querySelector('tbody');
    tbody.innerHTML = '';
    [...input].forEach(char => {
      const code = char.charCodeAt(0);
      const convertible = code >= 0x21 && code <= 0x7e;
      addCharacterDetails(tbody, char, convertible);
    });
    updateConvertedText();
  });

  document.getElementById('convertAllButton').addEventListener('click', function() {
    const input = document.getElementById('inputText').value;
    let convertedText = '';
    [...input].forEach(char => {
      const code = char.charCodeAt(0);
      if (code >= 0x21 && code <= 0x7e) {
        convertedText += String.fromCharCode(code + 0xFEE0);
      } else {
        convertedText += char;
      }
    });
    document.getElementById('convertedText').value = convertedText;
  });

  document.getElementById('searchInput').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredChars = Object.values(categories).flat().filter(char => {
      const description = categoryDescriptions[char.charCodeAt(0).toString(16).toUpperCase()];
      return description && description.toLowerCase().includes(searchTerm);
    });
    displayCategoryCharacters(filteredChars);
  });
});

function addCharacterDetails(tbody, char, convertible) {
  const row = tbody.insertRow();
  const charCell = row.insertCell(0);
  const codeCell = row.insertCell(1);
  const convertCell = row.insertCell(2);
  charCell.textContent = char;
  codeCell.textContent = `U+${char.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()}`;
  if (convertible) {
    convertCell.innerHTML = `<input type="checkbox" onchange="updateConvertedText()" />`;
  } else {
    convertCell.innerHTML = `<span class="text-red-500">✗</span>`;
  }
}

function updateConvertedText() {
  const checkboxes = document.querySelectorAll('#characterDetails input[type="checkbox"]:checked');
  let convertedText = '';
  checkboxes.forEach(checkbox => {
    const char = checkbox.parentNode.parentNode.cells[0].textContent;
    const code = char.charCodeAt(0);
    convertedText += String.fromCharCode(code + 0xFEE0);
  });
  document.getElementById('convertedText').value = convertedText;
}

function setupCategoryFilters(categories) {
  const filtersDiv = document.getElementById('filters');
  let activeFilter = null;
  Object.keys(categories).forEach(category => {
    const categoryButton = document.createElement('button');
    categoryButton.textContent = categoryDescriptions[category] || category;
    categoryButton.className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block mb-2";
    categoryButton.onclick = () => {
      if (activeFilter === category) {
        // show all
        activeFilter = null;
        categoryButton.classList.remove('bg-blue-800');
        displayCategoryCharacters(Object.values(categories).flat());
      } else {
        // show selected
        if (activeFilter) {
          filtersDiv.querySelector(`[data-category="${activeFilter}"]`).classList.remove('bg-blue-800');
        }
        activeFilter = category;
        categoryButton.classList.add('bg-blue-800');
        displayCategoryCharacters(categories[category]);
      }
    };
    categoryButton.setAttribute('data-category', category);
    filtersDiv.appendChild(categoryButton);
  });
}

  function displayCategoryCharacters(chars) {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = '';
    chars.forEach(char => {
      const div = document.createElement('div');
      div.className = "p-2 bg-white border border-gray-300 text-center cursor-pointer hover:bg-blue-100";
      div.textContent = char;
      div.onclick = () => {
        document.getElementById('inputText').value += char;
        document.getElementById('inputText').dispatchEvent(new Event('input'));
      };
      grid.appendChild(div);
    });
  }
  