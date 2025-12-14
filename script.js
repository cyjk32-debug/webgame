const BOARD_SIZE = 8; // 보드의 크기 (8x8)
const NUM_GEMS = 5; // 보석 종류 수 (0부터 4까지)
const gameBoard = document.getElementById('game-board');

let board = [];
let selectedTile = null;

// 게임 상태 변수
let score = 0;
let level = 1;
const MAX_LEVEL = 100; // 100 단계로 확장 적용됨
const LEVEL_SCORE_INCREMENT = 1000; // 단계별 필요 점수
const SCORE_PER_TILE = 10; // 타일 한 개 제거당 얻는 점수
let targetScore = 0;
let isGameStarted = false; // ★★★ BGM 재생 상태 추적 변수 추가 ★★★

// 보석 종류 (이모지)
const GEMS = ['🎅', '🎅🏿', '🎄', '🎁', '🦌'];

// 사운드 객체
const matchSound = new Audio('match.mp3'); 
const levelUpSound = new Audio('levelup.mp3'); 
const bgm = new Audio('background_music.mp3'); 
bgm.loop = true; 

// 게임 정보를 화면에 업데이트하는 함수
function updateGameInfo() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    const messageElement = document.getElementById('game-message');

    if (level > MAX_LEVEL) {
        // 게임 클리어 상태
        document.getElementById('target-score').textContent = "---";
        messageElement.textContent = "최고 레벨 달성! 게임 클리어!";
    } else {
        document.getElementById('target-score').textContent = targetScore;
        if (level === MAX_LEVEL) {
            messageElement.textContent = `최종 단계! 목표 점수: ${targetScore}`;
        } else {
            messageElement.textContent = "";
        }
    }
}

// 1. 게임 보드 초기화 및 화면에 표시
function initBoard() {
    score = 0;
    level = 1;
    targetScore = level * LEVEL_SCORE_INCREMENT;
    updateGameInfo(); 
    
    // ★★★ BGM 자동 재생 시도 로직 제거 (initBoard에서는 실행하지 않음) ★★★
    // bgm.play().catch(e => console.log("BGM 자동 재생 실패...")); 
    
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 50px)`;
    gameBoard.innerHTML = ''; 

    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const gemType = Math.floor(Math.random() * NUM_GEMS);
            board[r][c] = gemType;
            createTile(r, c, gemType);
        }
    }
}

// 개별 타일(보석) DOM 요소 생성 및 이벤트 리스너 추가
function createTile(r, c, gemType) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.row = r;
    tile.dataset.col = c;
    tile.textContent = GEMS[gemType];
    tile.addEventListener('click', handleTileClick);
    gameBoard.appendChild(tile);
}

// 2. 타일 클릭 처리 (선택 및 교환)
function handleTileClick(event) {
    // ★★★ BGM 강제 재생 로직 추가 ★★★
    if (!isGameStarted) {
        bgm.play().catch(e => console.log("BGM 재생 실패."));
        isGameStarted = true;
    }
    // ★★★ BGM 강제 재생 로직 끝 ★★★

    const clickedTile = event.target;
    const r1 = parseInt(clickedTile.dataset.row);
    const c1 = parseInt(clickedTile.dataset.col);

    if (level > MAX_LEVEL) return; // 게임 클리어 시 조작 방지

    if (selectedTile === null) {
        selectedTile = clickedTile;
        clickedTile.classList.add('selected');
    }
    else {
        const r2 = parseInt(selectedTile.dataset.row);
        const c2 = parseInt(selectedTile.dataset.col);

        // 인접한 타일인지 확인
        const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

        if (isAdjacent) {
            trySwap(selectedTile, clickedTile);
        }
        
        selectedTile.classList.remove('selected');
        selectedTile = null;
    }
}

// 3. 타일 교환 로직 (변경 없음)
function trySwap(tile1, tile2) {
    const r1 = parseInt(tile1.dataset.row);
    const c1 = parseInt(tile1.dataset.col);
    const r2 = parseInt(tile2.dataset.row);
    const c2 = parseInt(tile2.dataset.col);

    [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];

    if (checkMatch(board, r1, c1) || checkMatch(board, r2, c2)) {
        [tile1.textContent, tile2.textContent] = [tile2.textContent, tile1.textContent];
        
        setTimeout(() => {
            handleMatches();
        }, 100); 
    } else {
        [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
        console.log("매치가 발생하지 않아 되돌립니다.");
    }
}

// 4. 매치 확인 (변경 없음)
function checkMatch(currentBoard, r, c) {
    const type = currentBoard[r][c];
    
    let horizontal = 1;
    for (let i = c + 1; i < BOARD_SIZE && currentBoard[r][i] === type; i++) horizontal++;
    for (let i = c - 1; i >= 0 && currentBoard[r][i] === type; i--) horizontal++;

    let vertical = 1;
    for (let i = r + 1; i < BOARD_SIZE && currentBoard[i][c] === type; i++) vertical++;
    for (let i = r - 1; i >= 0 && currentBoard[i][c] === type; i--) vertical++;

    return horizontal >= 3 || vertical >= 3;
}

// 5. 단계 상승 확인 (변경 없음)
function checkLevelUp() {
    if (level < MAX_LEVEL && score >= targetScore) {
        levelUpSound.play().catch(e => console.log("승리 사운드 재생 실패:", e));
        
        level++;
        targetScore = level * LEVEL_SCORE_INCREMENT; 
        alert(`🎉 축하합니다! ${level} 단계로 올라갔습니다!\n다음 목표 점수: ${targetScore}`);
        updateGameInfo();
        handleMatches(); 
    } else if (level === MAX_LEVEL && score >= targetScore) {
        levelUpSound.play().catch(e => console.log("최종 승리 사운드 재생 실패:", e));
        
        level++; 
        alert("🎊 최고 레벨 달성! 게임 클리어!");
        updateGameInfo();
    } else {
         handleMatches(); 
    }
}

// 6. 매치 제거 및 보드 업데이트 (변경 없음)
function handleMatches() {
    if (level > MAX_LEVEL) return; 

    let tilesToClear = new Set(); 
    let hasMatch = false;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const type = board[r][c];
            if (type === -1) continue; 

            let hMatch = [];
            for (let i = c; i < BOARD_SIZE && board[r][i] === type; i++) {
                hMatch.push({r, c: i});
            }
            if (hMatch.length >= 3) {
                hMatch.forEach(coord => tilesToClear.add(`${coord.r},${coord.c}`));
                hasMatch = true;
            }

            let vMatch = [];
            for (let i = r; i < BOARD_SIZE && board[i][c] === type; i++) {
                vMatch.push({r: i, c});
            }
            if (vMatch.length >= 3) {
                vMatch.forEach(coord => tilesToClear.add(`${coord.r},${coord.c}`));
                hasMatch = true;
            }
        }
    }

    if (hasMatch) {
        matchSound.play().catch(e => console.log("매치 사운드 재생 실패:", e));
        
        const pointsGained = tilesToClear.size * SCORE_PER_TILE;
        score += pointsGained;
        updateGameInfo(); 

        tilesToClear.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const tileElement = gameBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (tileElement) {
                tileElement.classList.add('clearing'); 
                board[r][c] = -1; 
            }
        });

        setTimeout(() => {
            dropAndRefill();
            checkLevelUp(); 
        }, 300); 
    }
}

// 7. 타일 떨어뜨리기 및 빈칸 채우기 (변경 없음)
function dropAndRefill() {
    let tilesNeedUpdate = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tileElement = gameBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);

            if (board[r][c] === -1) {
                const newGemType = Math.floor(Math.random() * NUM_GEMS);
                board[r][c] = newGemType;
                
                if (tileElement) {
                    tileElement.classList.remove('clearing'); 
                    tileElement.textContent = GEMS[newGemType];
                }
                tilesNeedUpdate = true;
            } else {
                if(tileElement) {
                   tileElement.classList.remove('clearing');
                }
            }
        }
    }
}

// 게임 시작
initBoard();



