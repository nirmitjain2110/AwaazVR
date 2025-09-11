class ReportApp {
    constructor() {
        this.apiUrl = 'http://localhost:3000';
        this.loadingSection = document.getElementById('loadingSection');
        this.errorSection = document.getElementById('errorSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsGrid = document.getElementById('resultsGrid');
        
        this.init();
    }

    init() {
        // Sample data for testing - replace with actual data collection
        const sampleQAPairs = [
            {
                question: "What are the key benefits of renewable energy?",
                userAnswer: "Renewable energy is clean and sustainable. It helps reduce carbon emissions and is better for the environment."
            },
            {
                question: "Explain the process of photosynthesis.",
                userAnswer: "Plants use sunlight to make food. They take in carbon dioxide and water and produce oxygen."
            },
            {
                question: "What are the main components of a computer?",
                userAnswer: "A computer has a CPU, memory, storage, and input/output devices. The CPU processes data while memory stores it temporarily."
            }
        ];

        this.fetchAnalysis(sampleQAPairs);
    }

    async fetchAnalysis(qaPairs) {
        try {
            this.showLoading();

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qaPairs })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.report && data.report.length > 0) {
                this.displayResults(data.report);
            } else {
                this.showError("No analysis data received from server");
            }

        } catch (error) {
            console.error('Error fetching analysis:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loadingSection.style.display = 'block';
        this.errorSection.style.display = 'none';
        this.resultsContainer.style.display = 'none';
    }

    showError(message = null) {
        this.loadingSection.style.display = 'none';
        this.errorSection.style.display = 'block';
        this.resultsContainer.style.display = 'none';

        if (message) {
            const errorMessage = this.errorSection.querySelector('.error-message p');
            errorMessage.textContent = message;
        }
    }

    showResults() {
        this.loadingSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.resultsContainer.style.display = 'block';
    }

    displayResults(results) {
        this.resultsGrid.innerHTML = '';

        results.forEach((result, index) => {
            const resultCard = this.createResultCard(result, index);
            this.resultsGrid.appendChild(resultCard);
        });

        this.showResults();
    }

    createResultCard(result, index) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const similarityScore = this.formatSimilarityScore(result['Similarity Score']);
        const similarityClass = this.getSimilarityClass(similarityScore);

        card.innerHTML = `
            <div class="question-section">
                <div class="question-label">Question ${index + 1}</div>
                <div class="question-text">${this.escapeHtml(result.Question)}</div>
            </div>

            <div class="answer-section">
                <div class="answer-label">Your Answer</div>
                <div class="answer-text">${this.escapeHtml(result['User Answer'])}</div>
            </div>

            <div class="metrics-section">
                <div class="metric-item">
                    <div class="metric-label">Similarity Score</div>
                    <div class="similarity-score ${similarityClass}">
                        ${(similarityScore * 100).toFixed(0)}%
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Performance</div>
                    <div class="similarity-score ${similarityClass}">
                        ${this.getPerformanceLabel(similarityScore)}
                    </div>
                </div>
            </div>

            ${result['Missing Points'] ? `
                <div class="missing-section">
                    <div class="missing-label">Areas for Improvement</div>
                    <div class="missing-points">${this.escapeHtml(result['Missing Points'])}</div>
                </div>
            ` : ''}
        `;

        return card;
    }

    formatSimilarityScore(score) {
        if (score === null || score === undefined) return 0;
        const numScore = parseFloat(score);
        return isNaN(numScore) ? 0 : Math.max(0, Math.min(1, numScore));
    }

    getSimilarityClass(score) {
        if (score >= 0.8) return 'score-excellent';
        if (score >= 0.6) return 'score-good';
        if (score >= 0.4) return 'score-fair';
        return 'score-poor';
    }

    getPerformanceLabel(score) {
        if (score >= 0.8) return 'Excellent';
        if (score >= 0.6) return 'Good';
        if (score >= 0.4) return 'Fair';
        return 'Needs Work';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReportApp();
});

// Add CSS classes for different score levels
const style = document.createElement('style');
style.textContent = `
    .score-excellent {
        color: #4caf50 !important;
    }
    .score-good {
        color: #8bc34a !important;
    }
    .score-fair {
        color: #ffa726 !important;
    }
    .score-poor {
        color: #f44336 !important;
    }
`;
document.head.appendChild(style);