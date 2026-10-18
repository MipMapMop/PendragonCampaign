
const buttons = document.querySelectorAll("nav button");
const pages = document.querySelectorAll("main section");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedPage = button.dataset.page;

        pages.forEach(page => {
            page.hidden = page.id !== selectedPage;
        });

        buttons.forEach(otherButton => {
            if (otherButton === button) {
                otherButton.setAttribute("aria-current", "page");
            } else {
                otherButton.removeAttribute("aria-current");
            }
        });
    });
});

// Default character identity data
const defaultCharacter = {
    characterName: "",
    playerName: "",
    gender: "",
    yearOfBirth: "",
    heir: "",
    culture: "",
    homeland: "",
    religion: "",
    socialStatus: "",
    liegeLord: "",
    distinctiveFeatures: "",
    personalBackground: "",
    blazon: "",
    ideal: "",
    escutcheonImage: "",
    directedTrait1: "",
    directedTrait2: "",
    siz: "",
    dex: "",
    str: "",
    con: "",
    app: "",
    currentHp: "",
    wound1: "",
    wound2: "",
    wound3: "",
    wound4: "",
    wound5: "",
    wound6: "",
    wound7: "",
    traits: {
        chaste: 10,
        energetic: 10,
        forgiving: 10,
        generous: 10,
        honest: 10,
        just: 10,
        merciful: 10,
        modest: 10,
        prudent: 10,
        spiritual: 10,
        temperate: 10,
        trusting: 10,
        valorous: 10
    },
        traitChecks: {},
    passions: {
        fidelitas: [
            { checked: false, type: "", object: "", score: 0 },
            { checked: false, type: "", object: "", score: 0 },
            { checked: false, type: "", object: "", score: 0 },
            { checked: false, type: "", object: "", score: 0 }
        ]
    }
};


// Load previously saved character data
let savedCharacter = {};

try {
    const storedData = localStorage.getItem("pendragonCharacter");

    if (storedData) {
        savedCharacter = JSON.parse(storedData);
    }
} catch (error) {
    console.error("Could not load saved character data:", error);
}

const character = {
    ...defaultCharacter,
    ...savedCharacter
};

window.character = character;

const identityForm = document.querySelector("#identity-form");

// Restore saved values into the form
Object.entries(character).forEach(([name, value]) => {
    const field = identityForm.elements.namedItem(name);

    if (field) {
        field.value = value;
    }
});


 // Save changes automatically
identityForm.addEventListener("input", event => {
    const field = event.target;

    if (Object.hasOwn(defaultCharacter, field.name)) {
        character[field.name || field.id] = field.value;

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save character data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }
    }
});


// Update the identity panel on the Play screen


function updatePlayIdentity() {
    const name = character.characterName.trim();

    document.querySelector("#play-character-name").textContent =
        name || "Unnamed Character";

    const summaryParts = [];

    if (character.culture) {
        summaryParts.push("Culture: " + character.culture);
    }

    if (character.homeland) {
        summaryParts.push("Homeland: " + character.homeland);
    }

    if (character.religion) {
        summaryParts.push("Religion: " + character.religion);
    }

    document.querySelector("#play-character-summary").textContent =
        summaryParts.length > 0
            ? summaryParts.join(" · ")
            : "Culture · Homeland · Religion";

    const statusParts = [];

    if (character.socialStatus) {
        statusParts.push("Class: " + character.socialStatus);
    }

    if (character.liegeLord) {
        statusParts.push("Lord: " + character.liegeLord);
    }

    if (character.yearOfBirth) {
        statusParts.push("Born: " + character.yearOfBirth);
    }

    if (character.heir) {
        statusParts.push(
            "Heir: " +
            (character.heir === "yes" ? "Yes" : "No")
        );
    }

    document.querySelector("#play-character-status").textContent =
        statusParts.join(" · ");

    document.querySelector("#play-character-features").textContent =
    character.distinctiveFeatures
        ? "Distinctive Features: " + character.distinctiveFeatures
        : "";
}



// Update when the page loads
updatePlayIdentity();

// Update whenever character details change
identityForm.addEventListener("input", updatePlayIdentity);

// Save characteristics automatically
const characteristicFields = document.querySelectorAll(
    ".characteristics-grid input"
);

// Restore saved characteristic values
characteristicFields.forEach(field => {
    field.value = character[field.name] || "";
});

// Save changes when a characteristic is edited
characteristicFields.forEach(field => {
    field.addEventListener("input", () => {
        character[field.name] = field.value;

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save character data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }
    });
});

// Calculate and display derived character values

/* Calculate and display derived character values */
function updateDerivedValues() {
    const siz = Number(character.siz);
    const dex = Number(character.dex);
    const str = Number(character.str);
    const con = Number(character.con);

    const hasSiz = character.siz !== "";
    const hasDex = character.dex !== "";
    const hasStr = character.str !== "";
    const hasCon = character.con !== "";

    document.querySelector("#derived-knockdown").textContent =
        hasSiz ? siz : "—";

    document.querySelector("#derived-weapon-damage").textContent =
    hasSiz && hasStr ? `${Math.round((siz + str) / 6)}D6` : "—";

    document.querySelector("#derived-brawling-damage").textContent =
    hasSiz && hasStr ? Math.round((siz + str) / 6) : "—";

    document.querySelector("#derived-movement").textContent =
    hasDex && hasStr ? Math.round((str + dex) / 2 + 5) : "—";

    document.querySelector("#major-wound-threshold").textContent =
        hasCon ? con : "—";

    document.querySelector("#derived-healing").textContent =
    hasCon ? Math.round(con / 5) : "—";

    document.querySelector("#derived-hit-points").textContent =
        hasCon && hasSiz ? con + siz : "—";

    document.querySelector("#unconscious-threshold").textContent =
    hasCon && hasSiz ? Math.round((con + siz) / 4) : "—";
}


// Update the values when the page loads
updateDerivedValues();
updateCurrentHpDisplay();

// Update the values whenever a characteristic changes
characteristicFields.forEach(field => {
    field.addEventListener("input", () => {
        updateDerivedValues();
        updateCurrentHpDisplay();
    });
});

// Save and restore Current HP and wound fields
// Save and restore wound fields
const woundFields = document.querySelectorAll(
    ".wounds-list input, .additional-damage input"
);

// Restore saved values, including descriptions from the previous version
woundFields.forEach(field => {
    const fieldKey = field.name || field.id;

    if (character[fieldKey] !== undefined) {
        field.value = character[fieldKey];
        return;
    }

    // Restore wound descriptions saved by the previous version
    const legacyName = field.name
        ? field.name.match(/^wound(\d+)Description$/)
        : null;

    if (legacyName && character[`wound${legacyName[1]}`] !== undefined) {
        field.value = character[`wound${legacyName[1]}`];
        character[fieldKey] = field.value;
    }
});

// Calculate and display Current / Total Hit Points
function updateCurrentHpDisplay() {
    const hpDisplay = document.querySelector("#current-hp");
    const totalText = document.querySelector("#derived-hit-points").textContent.trim();

    if (totalText === "—" || totalText === "") {
        hpDisplay.textContent = "—";
        return;
    }

    const totalHp = Number(totalText);

    const woundDamage = Array.from(
    document.querySelectorAll('.wounds-list input[name$="Damage"]')
).reduce((sum, field) => {
    return sum + (field.value === "" ? 0 : Math.max(0, Number(field.value) || 0));
}, 0);

const aggravationDamage = Math.max(
    0,
    Number(document.querySelector("#aggravation-damage").value) || 0
);

const deteriorationDamage = Math.max(
    0,
    Number(document.querySelector("#deterioration-damage").value) || 0
);

const totalDamage = woundDamage + aggravationDamage + deteriorationDamage;

    const currentHp = Math.max(0, totalHp - totalDamage);

    hpDisplay.textContent = `${currentHp}/${totalHp}`;
}

// Save changes automatically
woundFields.forEach(field => {
    field.addEventListener("input", () => {
        character[field.name || field.id] = field.value;

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save condition data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }

        updateCurrentHpDisplay();
    });
});

// Show the initial Hit Points display
updateCurrentHpDisplay();



/* Personality Trait sliders, values and automatic saving */
document.querySelectorAll(".trait-control").forEach((row) => {
    const slider = row.querySelector(".trait-slider");
    const leftInput = row.querySelector(".trait-left");
    const rightInput = row.querySelector(".trait-right");
    const traitName = row.dataset.trait;

    if (!slider || !leftInput || !rightInput || !traitName) return;

    // Restore the saved value, or use 10 for a new character.
    const savedLeft = character.traits?.[traitName] ?? 10;

    function updateTrait(leftValue) {
        const left = Math.max(0, Math.min(20, Math.round(leftValue)));
        const right = 20 - left;

        slider.value = left;
        leftInput.value = left;
        rightInput.value = right;

        // Store the left value; the right value is always 20 minus left.
        character.traits[traitName] = left;

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save Trait data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }
    }

    slider.addEventListener("input", () => {
        updateTrait(Number(slider.value));
    });

    leftInput.addEventListener("change", () => {
        if (leftInput.value === "") return;
        updateTrait(Number(leftInput.value));
    });

    rightInput.addEventListener("change", () => {
        if (rightInput.value === "") return;
        updateTrait(20 - Number(rightInput.value));
    });

    // Restore the saved value without losing other character data.
    updateTrait(Number(savedLeft));
});

/* Personality trait checkboxes and automatic saving */
document.querySelectorAll(".trait-control").forEach((row) => {
    const traitName = row.dataset.trait;
    const leftCheck = row.querySelector(".trait-left-check");
    const rightCheck = row.querySelector(".trait-right-check");

    if (!traitName || (!leftCheck && !rightCheck)) return;

    const savedChecks = character.traitChecks?.[traitName] ?? {};

    if (leftCheck) {
        leftCheck.checked = savedChecks.left ?? false;

        leftCheck.addEventListener("change", () => {
            saveTraitChecks(traitName, leftCheck, rightCheck);
        });
    }

    if (rightCheck) {
        rightCheck.checked = savedChecks.right ?? false;

        rightCheck.addEventListener("change", () => {
            saveTraitChecks(traitName, leftCheck, rightCheck);
        });
    }
});

/* Personality trait checkboxes and automatic saving */
document.querySelectorAll(".trait-control").forEach((row) => {
    const traitName = row.dataset.trait;
    const leftCheck = row.querySelector(".trait-left-check");
    const rightCheck = row.querySelector(".trait-right-check");

    if (!traitName || (!leftCheck && !rightCheck)) return;

    const savedChecks = character.traitChecks?.[traitName] ?? {};

    if (leftCheck) {
        leftCheck.checked = savedChecks.left ?? false;

        leftCheck.addEventListener("change", () => {
            saveTraitChecks(traitName, leftCheck, rightCheck);
        });
    }

    if (rightCheck) {
        rightCheck.checked = savedChecks.right ?? false;

        rightCheck.addEventListener("change", () => {
            saveTraitChecks(traitName, leftCheck, rightCheck);
        });
    }
});

function saveTraitChecks(traitName, leftCheck, rightCheck) {
    if (!character.traitChecks) {
        character.traitChecks = {};
    }

    character.traitChecks[traitName] = {
        left: leftCheck ? leftCheck.checked : false,
        right: rightCheck ? rightCheck.checked : false
    };

    try {
        localStorage.setItem(
            "pendragonCharacter",
            JSON.stringify(character)
        );

        document.querySelector("#save-status").textContent =
            "Saved locally";
    } catch (error) {
        console.error("Could not save Trait checkbox data:", error);
        document.querySelector("#save-status").textContent =
            "Save failed";
    }
}



/* Save Blazon, Ideal and Directed Traits automatically */
const playFields = [
    ["blazon", "blazon"],
    ["ideal", "ideal"],
    ["directed-trait-1", "directedTrait1"],
    ["directed-trait-2", "directedTrait2"]
];

playFields.forEach(([id, property]) => {
    const field = document.getElementById(id);

    if (!field) return;

    // Restore the saved value.
    field.value = character[property] ?? "";

    // Save whenever the field is edited.
    field.addEventListener("input", () => {
        character[property] = field.value;

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save field:", error);
            document.querySelector("#save-status").textContent =
                "Save failed";
        }
    });
});

/* Passions: calculate Court totals */
function updatePassionCourtTotal(courtName) {
    const rows = document.querySelectorAll(
        `.passion-row[data-court="${courtName}"]`
    );

    let total = 0;

    rows.forEach((row) => {
        const scoreInput = row.querySelector(".passion-score");
        const score = Number(scoreInput?.value);

        if (Number.isFinite(score)) {
            total += score;
        }
    });

    const totalDisplay = document.querySelector(`#${courtName}-total`);

    if (totalDisplay) {
        totalDisplay.textContent = total;
    }
}

/* Passions: save and restore Fidelitas rows */
const fidelitasRows = document.querySelectorAll(
    '.passion-row[data-court="fidelitas"]'
);

fidelitasRows.forEach((row, index) => {
    const checkbox = row.querySelector(".passion-check");
    const typeInput = row.querySelector(".passion-type");
    const objectInput = row.querySelector(".passion-object");
    const scoreInput = row.querySelector(".passion-score");

    const savedPassion = character.passions?.fidelitas?.[index];

    // Restore saved values when the page loads.
    if (savedPassion) {
        checkbox.checked = savedPassion.checked ?? false;
        typeInput.value = savedPassion.type ?? "";
        objectInput.value = savedPassion.object ?? "";
        scoreInput.value = savedPassion.score ?? 0;
    }

    // Save this row whenever one of its fields changes.
    function savePassion() {
        if (!character.passions) {
            character.passions = {};
        }

        if (!character.passions.fidelitas) {
            character.passions.fidelitas = [];
        }

        character.passions.fidelitas[index] = {
            checked: checkbox.checked,
            type: typeInput.value,
            object: objectInput.value,
            score: Number(scoreInput.value) || 0
        };

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save Passion data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }

        updatePassionCourtTotal("fidelitas");
    }

    checkbox.addEventListener("change", savePassion);
    typeInput.addEventListener("change", savePassion);
    objectInput.addEventListener("input", savePassion);
    scoreInput.addEventListener("input", savePassion);
});

// Recalculate after restoring the saved Passion scores.
updatePassionCourtTotal("fidelitas");



/* Update the Fidelitas total when a score changes */
document.querySelectorAll(
    '.passion-row[data-court="fidelitas"] .passion-score'
).forEach((input) => {
    input.addEventListener("input", () => {
        updatePassionCourtTotal("fidelitas");
    });
});

/* Calculate the initial total when the page loads */
updatePassionCourtTotal("fidelitas");


/* Passions: save and restore Fervor rows */
const fervorRows = document.querySelectorAll(
    '.passion-row[data-court="fervor"]'
);

fervorRows.forEach((row, index) => {
    const checkbox = row.querySelector(".passion-check");
    const typeInput = row.querySelector(".passion-type");
    const objectInput = row.querySelector(".passion-object");
    const scoreInput = row.querySelector(".passion-score");

    const savedPassion = character.passions?.fervor?.[index];

    // Restore saved values when the page loads.
    if (savedPassion) {
        checkbox.checked = savedPassion.checked ?? false;
        typeInput.value = savedPassion.type ?? "";
        objectInput.value = savedPassion.object ?? "";
        scoreInput.value = savedPassion.score ?? 0;
    }

    // Save this row whenever one of its fields changes.
    function savePassion() {
        if (!character.passions) {
            character.passions = {};
        }

        if (!character.passions.fervor) {
            character.passions.fervor = [];
        }

        character.passions.fervor[index] = {
            checked: checkbox.checked,
            type: typeInput.value,
            object: objectInput.value,
            score: Number(scoreInput.value) || 0
        };

        try {
            localStorage.setItem(
                "pendragonCharacter",
                JSON.stringify(character)
            );

            document.querySelector("#save-status").textContent =
                "Saved locally";
        } catch (error) {
            console.error("Could not save Passion data:", error);

            document.querySelector("#save-status").textContent =
                "Save failed";
        }

        updatePassionCourtTotal("fervor");
    }

    checkbox.addEventListener("change", savePassion);
    typeInput.addEventListener("change", savePassion);
    objectInput.addEventListener("input", savePassion);
    scoreInput.addEventListener("input", savePassion);
});

// Recalculate after restoring the saved Passion scores.
updatePassionCourtTotal("fervor");


/* Update the Fervor total when a score changes */
document.querySelectorAll(
    '.passion-row[data-court="fervor"] .passion-score'
).forEach((input) => {
    input.addEventListener("input", () => {
        updatePassionCourtTotal("fervor");
    });
});

/* Calculate the initial Fervor total when the page loads */
updatePassionCourtTotal("fervor");

/* Update the Adoratio total when a score changes */
document.querySelectorAll(
    '.passion-row[data-court="adoratio"] .passion-score'
).forEach((input) => {
    input.addEventListener("input", () => {
        updatePassionCourtTotal("adoratio");
    });
});

/* Calculate the initial Adoratio total when the page loads */
updatePassionCourtTotal("adoratio");


/* Save and restore Adoratio passions */
const adoratioRows = document.querySelectorAll(
    '.passion-row[data-court="adoratio"]'
);

character.passions.adoratio ??= [];

adoratioRows.forEach((row, index) => {
    const passion = character.passions.adoratio[index] ?? {
        checked: false,
        type: "",
        object: "",
        score: 0
    };

    const checkbox = row.querySelector(".passion-check");
    const type = row.querySelector(".passion-type");
    const object = row.querySelector(".passion-object");
    const score = row.querySelector(".passion-score");

    checkbox.checked = passion.checked;
    type.value = passion.type;
    object.value = passion.object;
    score.value = passion.score;

    const saveAdoratio = () => {
        character.passions.adoratio[index] = {
            checked: checkbox.checked,
            type: type.value,
            object: object.value,
            score: Number(score.value) || 0
        };

        localStorage.setItem(
            "pendragonCharacter",
            JSON.stringify(character)
        );

        updatePassionCourtTotal("adoratio");
    };

    checkbox.addEventListener("change", saveAdoratio);
    type.addEventListener("change", saveAdoratio);
    object.addEventListener("input", saveAdoratio);
    score.addEventListener("input", saveAdoratio);
});

/* Calculate the restored Adoratio total */
updatePassionCourtTotal("adoratio");



/* Save and restore Civilitas passions */
const civilitasRows = document.querySelectorAll(
    '.passion-row[data-court="civilitas"]'
);

character.passions.civilitas ??= [];

civilitasRows.forEach((row, index) => {
    const passion = character.passions.civilitas[index] ?? {
        checked: false,
        type: "",
        object: "",
        score: 0
    };

    const checkbox = row.querySelector(".passion-check");
    const type = row.querySelector(".passion-type");
    const object = row.querySelector(".passion-object");
    const score = row.querySelector(".passion-score");

    checkbox.checked = passion.checked;
    type.value = passion.type;
    object.value = passion.object;
    score.value = passion.score;

    const saveCivilitas = () => {
        character.passions.civilitas[index] = {
            checked: checkbox.checked,
            type: type.value,
            object: object.value,
            score: Number(score.value) || 0
        };

        localStorage.setItem(
            "pendragonCharacter",
            JSON.stringify(character)
        );

        updatePassionCourtTotal("civilitas");
    };

    checkbox.addEventListener("change", saveCivilitas);
    type.addEventListener("change", saveCivilitas);
    object.addEventListener("input", saveCivilitas);
    score.addEventListener("input", saveCivilitas);
});

/* Calculate the restored Civilitas total */
updatePassionCourtTotal("civilitas");



 // Escutcheon image upload and local saving
const escutcheonUpload = document.querySelector("#escutcheon-upload");
const escutcheonImage = document.querySelector("#escutcheon-image");
const escutcheonPrompt = document.querySelector("#escutcheon-prompt");
const removeEscutcheonButton = document.querySelector("#remove-escutcheon");

function displayEscutcheon(imageData) {
    if (imageData) {
        escutcheonImage.src = imageData;
        escutcheonImage.hidden = false;
        escutcheonPrompt.hidden = true;
        removeEscutcheonButton.hidden = false;
    } else {
        escutcheonImage.removeAttribute("src");
        escutcheonImage.hidden = true;
        escutcheonPrompt.hidden = false;
        removeEscutcheonButton.hidden = true;
    }
}

function saveEscutcheon() {
    try {
        localStorage.setItem(
            "pendragonCharacter",
            JSON.stringify(character)
        );

        document.querySelector("#save-status").textContent =
            "Saved locally";

        return true;
    } catch (error) {
        console.error("Could not save escutcheon image:", error);
        document.querySelector("#save-status").textContent =
            "Save failed";

        return false;
    }
}

// Restore the saved image when the app opens
displayEscutcheon(character.escutcheonImage);

// Select and save an image
escutcheonUpload.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        escutcheonUpload.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {
        alert("Please select an image no larger than 1 MB.");
        escutcheonUpload.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const previousImage = character.escutcheonImage;
        character.escutcheonImage = reader.result;

        if (saveEscutcheon()) {
            displayEscutcheon(reader.result);
        } else {
            character.escutcheonImage = previousImage;
        }

        escutcheonUpload.value = "";
    };

    reader.onerror = () => {
        alert("The image could not be read. Please try another file.");
        escutcheonUpload.value = "";
    };

    reader.readAsDataURL(file);
});

// Remove the image and restore the prompt
removeEscutcheonButton.addEventListener("click", () => {
    const previousImage = character.escutcheonImage;
    character.escutcheonImage = "";

    if (saveEscutcheon()) {
        displayEscutcheon("");
    } else {
        character.escutcheonImage = previousImage;
    }
});


