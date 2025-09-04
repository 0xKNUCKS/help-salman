// Comedic donation functionality
let donationCount = 0;
let currentMessageId = null;

// Random withdrawal quotes
const withdrawalQuotes = [
    "Successfully withdrew from your credit card",
    "Emptied your entire savings account",
    "Charged your mom's credit card",
    "Sold your car without permission", 
    "Liquidated your retirement fund",
    "Borrowed against your house",
    "Raided your college fund",
    "Pawned your wedding ring",
    "Sold your kidney on the black market",
    "Emptied your children's piggy bank",
    "Maxed out all your credit cards",
    "Took a loan from loan sharks",
    "Sold your firstborn child",
    "Mortgaged your soul to the devil",
    "Traded your dignity for cash",
    "Hacked into your employer's payroll",
    "Started a GoFundMe in your name",
    "Sold your gaming setup",
    "Pawned your grandmother's jewelry",
    "Cancelled your Netflix subscription (the ultimate sacrifice)"
];

// Obscure currencies with their symbols
const currencies = [
    { name: "Shekels", symbol: "₪" },
    { name: "Dinars", symbol: "د.ك" },
    { name: "Rupees", symbol: "₹" },
    { name: "Rubles", symbol: "₽" },
    { name: "Won", symbol: "₩" },
    { name: "Zloty", symbol: "zł" },
    { name: "Hryvnia", symbol: "₴" },
    { name: "Manat", symbol: "₼" },
    { name: "Tenge", symbol: "₸" },
    { name: "Lari", symbol: "₾" },
    { name: "Dram", symbol: "֏" },
    { name: "Som", symbol: "с" },
    { name: "Vatu", symbol: "VT" },
    { name: "Kip", symbol: "₭" },
    { name: "Riel", symbol: "៛" },
    { name: "Tugrik", symbol: "₮" },
    { name: "Birr", symbol: "Br" },
    { name: "Nakfa", symbol: "Nfk" },
    { name: "Ouguiya", symbol: "UM" },
    { name: "Bitcoin", symbol: "₿" },
    { name: "Dogecoin", symbol: "Ð" },
    { name: "Monopoly Money", symbol: "M$" },
    { name: "Chuck E. Cheese Tokens", symbol: "🐭" },
    { name: "Schrute Bucks", symbol: "SB" },
    { name: "Stanley Nickels", symbol: "SN" }
];

function getRandomQuote() {
    return withdrawalQuotes[Math.floor(Math.random() * withdrawalQuotes.length)];
}

function getRandomCurrency() {
    return currencies[Math.floor(Math.random() * currencies.length)];
}

function generateRandomAmount() {
    // Base amount increases with each donation
    const baseAmount = 50 + (donationCount * 25);
    const randomMultiplier = Math.random() * 10 + 1; // 1-11x multiplier
    const amount = Math.floor(baseAmount * randomMultiplier);
    
    // Add some chaos to the numbers
    const chaosNumbers = [69, 420, 1337, 9000, 42, 666, 777, 123.45, 999.99];
    if (Math.random() < 0.3) { // 30% chance for chaos number
        return chaosNumbers[Math.floor(Math.random() * chaosNumbers.length)];
    }
    
    return amount;
}

function createDonationMessage() {
    donationCount++;
    
    // Remove existing message if present
    if (currentMessageId) {
        const existingMessage = document.getElementById(currentMessageId);
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    const quote = getRandomQuote();
    const currency = getRandomCurrency();
    const amount = generateRandomAmount();
    
    // Create message element
    const messageId = `donation-message-${Date.now()}`;
    currentMessageId = messageId;
    
    const messageElement = document.createElement('div');
    messageElement.id = messageId;
    messageElement.className = 'donation-message';
    messageElement.innerHTML = `
        <div class="donation-text">
            <span class="withdrawal-quote">${quote}</span>
            <span class="donation-amount">to donate ${currency.symbol}${amount} ${currency.name}</span>
        </div>
    `;
    
    // Find the donation button and insert message after the entire button container
    const donateButton = document.querySelector('input[value="💝 DONATE NOW"]');
    const buttonRow = donateButton.parentElement.parentElement; // td -> tr
    const buttonTable = buttonRow.parentElement; // tr -> table
    const buttonContainer = buttonTable.parentElement; // table -> td
    const mainContentTable = buttonContainer.parentElement.parentElement.parentElement; // td -> tr -> table
    
    // Insert after the main content table (below both buttons)
    mainContentTable.parentNode.insertBefore(messageElement, mainContentTable.nextSibling);
    
    // Add entrance animation
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 10);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
            if (document.getElementById(messageId)) {
                messageElement.remove();
            }
            if (currentMessageId === messageId) {
                currentMessageId = null;
            }
        }, 300);
    }, 3000);
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const donateButton = document.querySelector('input[value="💝 DONATE NOW"]');
    if (donateButton) {
        donateButton.addEventListener('click', createDonationMessage);
        donateButton.style.cursor = 'pointer';
    }
});