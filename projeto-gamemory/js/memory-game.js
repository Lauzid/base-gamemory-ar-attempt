// Memory Game Component
AFRAME.registerComponent('memory-game', {
    init: function() {
        this.cards = [];
        this.flippedCards = [];
        this.pairsFound = 0;
        this.totalPairs = 8;
        this.canFlip = true;

        // Caminhos das imagens (duas de cada para formar pares)
        this.cardImages = [
            'assets/images/img1.png', 'assets/images/img1.png',
            'assets/images/img2.png', 'assets/images/img2.png',
            'assets/images/img3.png', 'assets/images/img3.png',
            'assets/images/img4.png', 'assets/images/img4.png',
            'assets/images/img5.png', 'assets/images/img5.png',
            'assets/images/img6.png', 'assets/images/img6.png',
            'assets/images/img7.png', 'assets/images/img7.png',
            'assets/images/img8.png', 'assets/images/img8.png'
        ];

        // Emparelhar imagens
        this.cardPairs = [];
        for (let i = 0; i < this.cardImages.length; i++) {
            this.cardPairs.push({
                image: this.cardImages[i]
            });
        }

        // Shuffle the card values
        this.shuffle(this.cardPairs);

        this.el.sceneEl.addEventListener('loaded', () => {
            this.createBoard();
        });

        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => this.resetGame());
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    createBoard: function() {
        const gameBoard = document.getElementById('game-board');
        while (gameBoard.firstChild) {
            gameBoard.removeChild(gameBoard.firstChild);
        }

        const cardWidth = 0.4;
        const cardHeight = 0.4;
        const gap = 0.1;
        const cols = 4;
        const rows = 4;

        const boardWidth = cols * cardWidth + (cols - 1) * gap;
        const boardHeight = rows * cardHeight + (rows - 1) * gap;

        const startX = -boardWidth / 2 + cardWidth / 2;
        const startY = boardHeight / 2 - cardHeight / 2;

        let cardIndex = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (cardWidth + gap);
                const y = startY - row * (cardHeight + gap);

                const cardPair = this.cardPairs[cardIndex];

                const card = document.createElement('a-entity');
                card.setAttribute('position', `${x} ${y} 0`);
                card.setAttribute('data-index', cardIndex);
                card.setAttribute('data-image', cardPair.image);
                card.setAttribute('class', 'card');

                // Frente da carta (virada para baixo)
                const cardFront = document.createElement('a-plane');
                cardFront.setAttribute('width', cardWidth);
                cardFront.setAttribute('height', cardHeight);
                cardFront.setAttribute('color', '#1E90FF');
                cardFront.setAttribute('position', '0 0 0.01');
                cardFront.setAttribute('class', 'card-front clickable');
                cardFront.setAttribute('card-hover', '');

                const questionMark = document.createElement('a-text');
                questionMark.setAttribute('value', '?');
                questionMark.setAttribute('color', 'white');
                questionMark.setAttribute('position', '0 0 0.02');
                questionMark.setAttribute('align', 'center');
                questionMark.setAttribute('width', 2);
                questionMark.setAttribute('scale', '0.5 0.5 0.5');
                cardFront.appendChild(questionMark);

                cardFront.addEventListener('click', () => {
                    this.flipCard(card);
                });

                // Verso da carta (imagem)
                const cardBack = document.createElement('a-entity');
                cardBack.setAttribute('position', '0 0 0.1');

                const cardImage = document.createElement('a-image');
                cardImage.setAttribute('src', cardPair.image);
                cardImage.setAttribute('width', cardWidth * 0.9);
                cardImage.setAttribute('height', cardHeight * 0.9);
                cardImage.setAttribute('visible', 'false');
                cardImage.setAttribute('class', 'card-image');
                cardBack.appendChild(cardImage);

                // Fundo branco para o verso
                const cardBackBg = document.createElement('a-plane');
                cardBackBg.setAttribute('width', cardWidth);
                cardBackBg.setAttribute('height', cardHeight);
                cardBackBg.setAttribute('color', '#FFFFFF');
                cardBackBg.setAttribute('position', '0 0 0');
                cardBackBg.setAttribute('visible', 'false');
                cardBackBg.setAttribute('class', 'card-back-bg');

                card.appendChild(cardFront);
                card.appendChild(cardBackBg);
                card.appendChild(cardBack);

                gameBoard.appendChild(card);
                this.cards.push(card);

                cardIndex++;
            }
        }

        console.log(`Criado tabuleiro com ${this.cards.length} cartas`);
    },
    
    flipCard: function(card) {
        const cardFront = card.querySelector('.card-front');
        const cardBackBg = card.querySelector('.card-back-bg');
        const cardImage = card.querySelector('.card-image');

        if (!this.canFlip ||
            this.flippedCards.includes(card) ||
            cardImage.getAttribute('visible') === true) {
            return;
        }

        cardFront.setAttribute('visible', false);
        cardFront.classList.remove('clickable');
        cardBackBg.setAttribute('visible', true);
        cardImage.setAttribute('visible', true);

        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 1000);
        }
    },

    checkMatch: function() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];

        const img1 = card1.getAttribute('data-image');
        const img2 = card2.getAttribute('data-image');

        if (img1 === img2) {
            this.pairsFound++;
            document.getElementById('score').textContent = `Pairs Found: ${this.pairsFound}`;
            const messageEl = document.getElementById('message');
            messageEl.textContent = 'Match found!';
            setTimeout(() => { messageEl.textContent = ''; }, 1500);
            this.flippedCards = [];
            if (this.pairsFound === this.totalPairs) {
                this.gameComplete();
            }
        } else {
            this.flippedCards.forEach(card => {
                const cardFront = card.querySelector('.card-front');
                const cardBackBg = card.querySelector('.card-back-bg');
                const cardImage = card.querySelector('.card-image');
                cardFront.setAttribute('visible', true);
                cardFront.classList.add('clickable');
                cardBackBg.setAttribute('visible', false);
                cardImage.setAttribute('visible', false);
            });
            const messageEl = document.getElementById('message');
            messageEl.textContent = 'No match!';
            setTimeout(() => { messageEl.textContent = ''; }, 1500);
            this.flippedCards = [];
        }
        this.canFlip = true;
    },
    
    gameComplete: function() {
        // Show victory message
        const victoryMessage = document.getElementById('victory-message');
        victoryMessage.setAttribute('visible', true);
        victoryMessage.setAttribute('text', 'opacity', 1);
        
        // Show restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.setAttribute('visible', true);
        
        // Display message
        const messageEl = document.getElementById('message');
        messageEl.textContent = 'Congratulations! You found all pairs!';
    },
    
    resetGame: function() {
        // Reset game variables
        this.flippedCards = [];
        this.pairsFound = 0;
        
        // Reset score
        document.getElementById('score').textContent = 'Pairs Found: 0';
        
        // Clear message
        document.getElementById('message').textContent = '';
        
        // Hide victory elements
        document.getElementById('victory-message').setAttribute('visible', false);
        document.getElementById('restart-button').setAttribute('visible', false);
        
        // Shuffle cards and recreate board
        this.shuffle(this.cardPairs);
        this.createBoard();
    }
});

// Componente auxiliar para melhorar o cursor
AFRAME.registerComponent('cursor-feedback', {
  init: function () {
    var el = this.el;
    
    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'color', '#4CAF50');
    });
    
    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', 'white');
    });
    
    el.addEventListener('click', function () {
      console.log('Cursor click detectado');
    });
  }
});

// Novo componente para o hover das cartas que não usa animation
AFRAME.registerComponent('card-hover', {
  init: function() {
    const el = this.el;
    const originalColor = '#1E90FF';
    const hoverColor = '#64B5F6';
    
    el.addEventListener('mouseenter', () => {
      el.setAttribute('material', 'color', hoverColor);
    });
    
    el.addEventListener('mouseleave', () => {
      el.setAttribute('material', 'color', originalColor);
    });
  }
});
