// Tab Switching Logic
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.ai-tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.ai-tab-btn').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Highlight button
    event.currentTarget.classList.add('active');
}

// Custom Designer Logic (Simulated AI)
function generateJewelryDesign() {
    const promptText = document.getElementById('ai-prompt').value.trim();
    
    if (!promptText) {
        alert("Please describe the jewelry you want the AI to design.");
        return;
    }

    // Hide button and result, show loading
    document.querySelector('#tab-design .ai-btn-generate').style.display = 'none';
    document.getElementById('result-design').style.display = 'none';
    document.getElementById('loading-design').style.display = 'block';

    // Simulate API Call delay (3.5 seconds)
    setTimeout(() => {
        document.getElementById('loading-design').style.display = 'none';
        document.getElementById('result-design').style.display = 'block';
        
        // Show the generate button again for new requests
        document.querySelector('#tab-design .ai-btn-generate').style.display = 'inline-flex';
        document.querySelector('#tab-design .ai-btn-generate').innerText = "✨ Generate Another Design";
    }, 3500);
}

// Outfit Matchmaker Logic (Simulated AI)
function handleOutfitUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('outfit-preview').src = e.target.result;
            document.getElementById('upload-box').style.display = 'none';
            document.getElementById('outfit-preview-container').style.display = 'block';
            
            // Hide previous results if any
            document.getElementById('result-match').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

function findOutfitMatch() {
    // Hide preview button and result, show loading
    document.querySelector('#outfit-preview-container .ai-btn-generate').style.display = 'none';
    document.getElementById('result-match').style.display = 'none';
    document.getElementById('loading-match').style.display = 'block';

    // Simulate API Call delay (4 seconds)
    setTimeout(() => {
        document.getElementById('loading-match').style.display = 'none';
        document.getElementById('result-match').style.display = 'block';
        
        // Show button again
        document.querySelector('#outfit-preview-container .ai-btn-generate').style.display = 'inline-flex';
        document.querySelector('#outfit-preview-container .ai-btn-generate').innerText = "🔍 Find Another Match";
    }, 4000);
}
