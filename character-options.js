// Pendragon Character Manager
// Skills, weapons and armour system
console.log("Character options system loaded.");
// Pendragon Character Manager
// Skills, weapons and armour system

const officialSkills = [
    // Non-combat skills
    { id: "awareness", name: "Awareness", group: "Non-combat" },
    { id: "chirurgery", name: "Chirurgery", group: "Non-combat" },
    { id: "compose", name: "Compose", group: "Non-combat" },
    { id: "courtesy", name: "Courtesy", group: "Non-combat" },
    { id: "dancing", name: "Dancing", group: "Non-combat" },
    { id: "falconry", name: "Falconry", group: "Non-combat" },
    { id: "fashion", name: "Fashion", group: "Non-combat" },
    { id: "first-aid", name: "First Aid", group: "Non-combat" },
    { id: "flirting", name: "Flirting", group: "Non-combat" },
    { id: "folklore", name: "Folklore", group: "Non-combat" },
    { id: "gaming", name: "Gaming", group: "Non-combat" },
    { id: "hunting", name: "Hunting", group: "Non-combat" },
    { id: "industry", name: "Industry", group: "Non-combat" },
    { id: "intrigue", name: "Intrigue", group: "Non-combat" },
    { id: "literacy", name: "Literacy", group: "Non-combat" },
    { id: "orate", name: "Orate", group: "Non-combat" },
    { id: "play-instrument", name: "Play Instrument", group: "Non-combat" },
    { id: "recognize", name: "Recognize", group: "Non-combat" },
    { id: "religion", name: "Religion", group: "Non-combat" },
    { id: "singing", name: "Singing", group: "Non-combat" },
    { id: "stewardship", name: "Stewardship", group: "Non-combat" },

    // Combat skills
    { id: "battle", name: "Battle", group: "Combat" },
    { id: "horsemanship", name: "Horsemanship", group: "Combat" },
    { id: "sword", name: "Sword", group: "Combat" },
    { id: "charge", name: "Charge", group: "Combat" },
    { id: "spear", name: "Spear", group: "Combat" },
    { id: "hafted", name: "Hafted", group: "Combat" },
    { id: "two-handed-hafted", name: "2H Hafted", group: "Combat" },
    { id: "brawling", name: "Brawling", group: "Combat" },
    { id: "bow", name: "Bow", group: "Combat" },
    { id: "crossbow", name: "Crossbow", group: "Combat" },
    { id: "thrown-weapon", name: "Thrown Weapon", group: "Combat" }
];

// Load the shared skill reference catalogue
let skillCatalogue = [];

try {
    const storedCatalogue = localStorage.getItem("pendragonSkillCatalogue");

    if (storedCatalogue) {
        skillCatalogue = JSON.parse(storedCatalogue);
    }
} catch (error) {
    console.error("Could not load skill catalogue:", error);
}

// Initialise the catalogue while preserving saved reference details
const savedSkillsById = new Map(
    (Array.isArray(skillCatalogue) ? skillCatalogue : [])
        .map(skill => [skill.id, skill])
);

skillCatalogue = officialSkills.map(skill => ({
    ...skill,
    use: "",
    glory: "",
    notes: "",
    modifiers: "",
    ...(savedSkillsById.get(skill.id) || {})
}));

// Save the catalogue separately from character data
try {
    localStorage.setItem(
        "pendragonSkillCatalogue",
        JSON.stringify(skillCatalogue)
    );
} catch (error) {
    console.error("Could not save skill catalogue:", error);
}

// Initialise skill data for the current character
if (!window.character.skills) {
    window.character.skills = {};
}

// Create entries for all official skills without overwriting saved values
officialSkills.forEach(skill => {
    if (!window.character.skills[skill.id]) {
        window.character.skills[skill.id] = {
            score: 0,
            experienceCheck: false
        };
    }
});

// Save the current character, including skill data
function saveCharacterOptions() {
    try {
        localStorage.setItem(
            "pendragonCharacter",
            JSON.stringify(window.character)
        );

        const saveStatus = document.querySelector("#save-status");

        if (saveStatus) {
            saveStatus.textContent = "Saved locally";
        }

        return true;
    } catch (error) {
        console.error("Could not save character options:", error);

        const saveStatus = document.querySelector("#save-status");

        if (saveStatus) {
            saveStatus.textContent = "Save failed";
        }

        return false;
    }
}


/* Display skills on the Play sheet */

function renderSkillList(group, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error("Could not find skill container:", containerId);
        return;
    }

    const skills = officialSkills.filter(skill => skill.group === group);

    container.innerHTML = "";

    skills.forEach(skill => {
        const savedSkill = window.character.skills[skill.id];

        const row = document.createElement("div");
        row.className = "skill-row";

        const name = document.createElement("label");
        name.className = "skill-name";
        name.textContent = skill.name;

        const score = document.createElement("input");
        score.type = "number";
        score.min = "0";
        score.step = "1";
        score.className = "skill-score";
        score.value = savedSkill.score;
        score.setAttribute("aria-label", skill.name + " score");

        score.addEventListener("input", () => {
            const value = score.value;

            window.character.skills[skill.id].score =
                value === "" ? "" : Number(value);

            saveCharacterOptions();
        });

        const checkLabel = document.createElement("label");
        checkLabel.className = "skill-check-label";
        checkLabel.title = "Experience check";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.className = "skill-check";
        check.checked = savedSkill.experienceCheck;
        check.setAttribute("aria-label", skill.name + " experience check");

        check.addEventListener("change", () => {
            window.character.skills[skill.id].experienceCheck = check.checked;
            saveCharacterOptions();
        });

        checkLabel.appendChild(check);

        row.appendChild(checkLabel);
        row.appendChild(name);
        row.appendChild(score);

        container.appendChild(row);
    });
}

function renderAllSkills() {
    renderSkillList("Non-combat", "non-combat-skills");
    renderSkillList("Combat", "combat-skills");
}

renderAllSkills();


/* Skills reference catalogue */

function saveSkillCatalogue() {
    try {
        localStorage.setItem(
            "pendragonSkillCatalogue",
            JSON.stringify(skillCatalogue)
        );
    } catch (error) {
        console.error("Could not save skill catalogue:", error);
    }
}

function renderSkillReference() {
    const container = document.getElementById("skill-reference-list");
    const filter = document.getElementById("skill-group-filter");

    if (!container || !filter) return;

    const selectedGroup = filter.value;

    const skills = skillCatalogue.filter(skill =>
        selectedGroup === "All" || skill.group === selectedGroup
    );

    container.innerHTML = "";

    skills.forEach(skill => {
        const card = document.createElement("div");
        card.className = "skill-reference-card";

        
        const details = document.createElement("details");
        details.className = "skill-reference-details";

        const summary = document.createElement("summary");
        summary.textContent = skill.name;

        details.appendChild(summary);

        const group = document.createElement("p");
        group.className = "skill-reference-group";
        group.textContent = skill.group;
        details.appendChild(group);


        function addTextField(labelText, property, multiline = false) {
            const label = document.createElement("label");
            label.className = "skill-reference-field";
            label.appendChild(document.createTextNode(labelText));

            const field = document.createElement(
                multiline ? "textarea" : "input"
            );

            if (!multiline) {
                field.type = "text";
            } else {
                field.rows = 2;
            }

            field.value = skill[property] || "";

            field.addEventListener("input", () => {
                skill[property] = field.value;
                saveSkillCatalogue();
            });

            label.appendChild(field);
            details.appendChild(label);
        }

        addTextField("Use", "use", true);

        const gloryLabel = document.createElement("label");
        gloryLabel.className = "skill-reference-field";
        gloryLabel.appendChild(document.createTextNode("Glory"));

        const glorySelect = document.createElement("select");

        [
            { value: "", text: "Not recorded" },
            { value: "yes", text: "Yes" },
            { value: "no", text: "No" }
        ].forEach(optionData => {
            const option = document.createElement("option");
            option.value = optionData.value;
            option.textContent = optionData.text;
            glorySelect.appendChild(option);
        });

        glorySelect.value = skill.glory || "";

        glorySelect.addEventListener("change", () => {
            skill.glory = glorySelect.value;
            saveSkillCatalogue();
        });

        gloryLabel.appendChild(glorySelect);
        details.appendChild(gloryLabel);

        addTextField("Notes", "notes", true);
        addTextField("Modifiers", "modifiers", true);

        card.appendChild(details);
        container.appendChild(card);
    });
}

document.getElementById("skill-group-filter")
    ?.addEventListener("change", renderSkillReference);

renderSkillReference();


/* Armour reference catalogue */

// Periods available for armour entries
const armourPeriods = [
    "All",
    "Uther",
    "Anarchy",
    "Boy King",
    "Conquest",
    "Romance",
    "Tournament",
    "Grail Quest",
    "Twilight"
];

// The five armour reference tables
const armourCategories = [
    { id: "helms", name: "Helms" },
    { id: "padding", name: "Padding" },
    { id: "mail", name: "Mail" },
    { id: "plate", name: "Plate" },
    { id: "shields", name: "Shields" }
];

// Load saved armour reference data
let armourCatalogue = [];

try {
    const storedArmour = localStorage.getItem(
        "pendragonArmourCatalogue"
    );

    if (storedArmour) {
        armourCatalogue = JSON.parse(storedArmour);
    }
} catch (error) {
    console.error("Could not load armour catalogue:", error);
}

// Ensure every category exists while preserving saved entries
armourCatalogue = armourCategories.map(category => {
    const savedCategory = Array.isArray(armourCatalogue)
        ? armourCatalogue.find(item => item.id === category.id)
        : null;

    return {
        ...category,
        items: savedCategory && Array.isArray(savedCategory.items)
            ? savedCategory.items
            : []
    };
});

// Save armour reference data separately from character data
function saveArmourCatalogue() {
    try {
        localStorage.setItem(
            "pendragonArmourCatalogue",
            JSON.stringify(armourCatalogue)
        );

        return true;
    } catch (error) {
        console.error("Could not save armour catalogue:", error);
        return false;
    }
}

// Save the initial catalogue structure
saveArmourCatalogue();


/* Render the editable armour reference tables */

function renderArmourReference() {
    const container = document.getElementById("armour-reference");

    if (!container) return;

    container.innerHTML = "";

    armourCatalogue.forEach(category => {
        const section = document.createElement("div");
        section.className = "armour-reference-section";

        const heading = document.createElement("h4");
        heading.textContent = category.name;
        section.appendChild(heading);

        const table = document.createElement("table");
        table.className = "armour-reference-table";

        const headers = category.id === "shields"
            ? ["Item", "Available", "Points", "Missile", "Notes", "Action"]
            : ["Item", "Available", "Points", "Notes", "Action"];

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        category.items.forEach((item, index) => {
            const row = document.createElement("tr");

            function addInput(property, type = "text") {
                const cell = document.createElement("td");
                const input = document.createElement("input");

                input.type = type;
                input.value = item[property] ?? "";

                if (type === "number") {
                    input.min = "0";
                    input.step = "1";
                }

                input.setAttribute("aria-label", category.name + " " + property);

                input.addEventListener("input", () => {
                    item[property] = type === "number"
                        ? (input.value === "" ? "" : Number(input.value))
                        : input.value;

                    saveArmourCatalogue();
                    renderCharacterArmour();
                });

                cell.appendChild(input);
                row.appendChild(cell);
            }

            addInput("name");

            


const availableCell = document.createElement("td");
const availableSelect = document.createElement("select");

availableSelect.setAttribute(
    "aria-label",
    category.name + " available period"
);

const noPeriodOption = document.createElement("option");
noPeriodOption.value = "";
noPeriodOption.textContent = "Select period";
availableSelect.appendChild(noPeriodOption);

armourPeriods.forEach(period => {
    const option = document.createElement("option");
    option.value = period;
    option.textContent = period;
    availableSelect.appendChild(option);
});

availableSelect.value = (item.available || [])[0] || "";

availableSelect.addEventListener("change", () => {
    item.available = availableSelect.value
        ? [availableSelect.value]
        : [];

    saveArmourCatalogue();
});

availableCell.appendChild(availableSelect);
row.appendChild(availableCell);


            addInput("points", "number");

            if (category.id === "shields") {
                addInput("missile", "number");
            }

            addInput("notes");

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this armour entry?")) return;

                category.items.splice(index, 1);
                saveArmourCatalogue();
                renderArmourReference();
                renderCharacterArmour();
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        section.appendChild(table);

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Add item";

        addButton.addEventListener("click", () => {
        category.items.push({
           id: "armour-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 9),
           name: "",
           available: [],
           points: "",
           missile: "",
           notes: ""
    });

    saveArmourCatalogue();
    renderArmourReference();
});

        section.appendChild(addButton);
        container.appendChild(section);
    });
}

renderArmourReference();


/* Connect armour reference tables to the character sheet */

function renderCharacterArmour() {
    const fields = {
        helm: {
            selectId: "armour-helm",
            pointsId: "armour-helm-points",
            categories: ["helms"]
        },
        padding: {
            selectId: "armour-padding",
            pointsId: "armour-padding-points",
            categories: ["padding"]
        },
        body: {
            selectId: "armour-body",
            pointsId: "armour-body-points",
            categories: ["mail", "plate"]
        },
        shield: {
            selectId: "armour-shield",
            pointsId: "armour-shield-points",
            categories: ["shields"]
        }
    };

    if (!window.character.armour) {
        window.character.armour = {};
    }

    let total = 0;

    Object.entries(fields).forEach(([key, config]) => {
        const select = document.getElementById(config.selectId);
        const pointsOutput = document.getElementById(config.pointsId);

        if (!select || !pointsOutput) return;

        const previousValue = window.character.armour[key] || "";

        const items = armourCatalogue
            .filter(category => config.categories.includes(category.id))
            .flatMap(category =>
                category.items.map(item => ({ ...item, categoryId: category.id }))
            );

        select.innerHTML = "";

        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "None selected";
        select.appendChild(emptyOption);

        items.forEach(item => {
            if (!item.id) {
                item.id = "armour-" + Date.now() + "-" +
                    Math.random().toString(36).slice(2, 9);
            }

            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.name || "(Unnamed item)";
            option.title = item.notes || "";
            select.appendChild(option);
        });

        select.value = items.some(item => item.id === previousValue)
            ? previousValue
            : "";

        if (select.value !== previousValue) {
            window.character.armour[key] = select.value;
        }

        const selectedItem = items.find(item => item.id === select.value);
        const points = selectedItem ? Number(selectedItem.points) || 0 : 0;

        pointsOutput.textContent = selectedItem
            ? String(selectedItem.points ?? "—")
            : "—";

        if (key !== "shield") {
            total += points;
        }

        select.onchange = () => {
            window.character.armour[key] = select.value;
            saveCharacterOptions();
            renderCharacterArmour();
        };
    });

    const totalOutput = document.getElementById("total-armour-protection");

    if (totalOutput) {
        totalOutput.textContent = String(total);
    }

    saveCharacterOptions();
}

renderCharacterArmour();

