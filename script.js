const BOARD_SIZE = 8; // 보드의 크기 (8x8)
const NUM_GEMS = 5; // 보석 종류 수 (0부터 4까지)
const gameBoard = document.getElementById('game-board');

let board = [];
let selectedTile = null;

// 게임 상태 변수
let score = 0;
let level = 1;
const MAX_LEVEL = 100; // 100 단계로 확장
const LEVEL_SCORE_INCREMENT = 500; // 단계별 필요 점수
const SCORE_PER_TILE = 10; // 타일 한 개 제거당 얻는 점수
let targetScore = 0;
let isGameStarted = false; // BGM 재생 상태 추적 변수

// ★★★ 피버 모드 관련 변수 추가 ★★★
const FEVER_MAX = 100; // 피버 게이지 최대값
const FEVER_INCREMENT = 10; // 매치된 타일당 게이지 증가량
const FEVER_DURATION = 10000; // 피버 지속 시간 (10초)
let feverGauge = 0; // 현재 피버 게이지
let isFeverMode = false; // 피버 모드 활성화 여부
let feverTimer = null; // 피버 모드 종료 타이머
// ★★★ 피버 모드 관련 변수 끝 ★★★

// 보석 종류 (이모지)
const GEMS = ['🎅', '🎅🏿', '🎄', '🎁', '🦌'];

// 사운드 객체
const matchSound = new Audio('1214.mp3'); 
const levelUpSound = new Audio('1214_1.mp3'); 
const bgm = new Audio('background_music.mp3');
bgm.loop = true; 

// 게임 정보를 화면에 업데이트하는 함수
function updateGameInfo() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    const messageElement = document.getElementById('game-message');

    if (level > MAX_LEVEL) {
        document.getElementById('target-score').textContent = "---";
        messageElement.textContent = "최고 레벨 달성! 게임 클리어!";
    } else {
        document.getElementById('target-score').textContent = targetScore;
        if (level === MAX_LEVEL) {
            messageElement.textContent = `최종 단계! 목표 점수: ${targetScore}`;
        } else if (!isFeverMode) { // 피버 중에는 메시지를 덮어쓰지 않음
            messageElement.textContent = "";
        }
    }
}

// ★★★ 피버 관리 함수 추가 ★★★
function updateFeverGauge() {
    const feverBarElement = document.getElementById('fever-bar');
    const percent = (feverGauge / FEVER_MAX) * 100;
    feverBarElement.style.width = `${percent}%`;

    if (feverGauge >= FEVER_MAX && !isFeverMode) {
        activateFeverMode();
    }
}

function activateFeverMode() {
    isFeverMode = true;
    feverGauge = FEVER_MAX;
    document.getElementById('game-message').textContent = "🔥🔥🔥 FEVER TIME! (점수 2배) 🔥🔥🔥";
    gameBoard.classList.add('fever-active'); 

    // 피버 지속 시간 타이머 설정
    feverTimer = setTimeout(() => {
        deactivateFeverMode();
    }, FEVER_DURATION);
}

function deactivateFeverMode() {
    isFeverMode = false;
    feverGauge = 0; 
    clearTimeout(feverTimer);
    document.getElementById('game-message').textContent = "";
    gameBoard.classList.remove('fever-active');
    updateFeverGauge();
    updateGameInfo(); // 피버 메시지 제거 후 단계 메시지 복구
}
// ★★★ 피버 관리 함수 끝 ★★★


// 1. 게임 보드 초기화 및 화면에 표시
function initBoard() {
    score = 0;
    level = 1;
    targetScore = level * LEVEL_SCORE_INCREMENT;

    // 피버 상태 초기화
    feverGauge = 0;
    isFeverMode = false;
    clearTimeout(feverTimer);
    
    updateGameInfo(); 
    updateFeverGauge();
    
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
    // ★★★ BGM 강제 재생 로직 추가 (첫 클릭 시) ★★★
    if (!isGameStarted) {
        bgm.play().catch(e => console.log("BGM 재생 실패."));
        isGameStarted = true;
    }
    // ★★★ BGM 강제 재생 로직 끝 ★★★

    const clickedTile = event.target;
    const r1 = parseInt(clickedTile.dataset.row);
    const c1 = parseInt(clickedTile.dataset.col);

    if (level > MAX_LEVEL) return; 

    if (selectedTile === null) {
        selectedTile = clickedTile;
        clickedTile.classList.add('selected');
    }
    else {
        const r2 = parseInt(selectedTile.dataset.row);
        const c2 = parseInt(selectedTile.dataset.col);

        const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

        if (isAdjacent) {
            trySwap(selectedTile, clickedTile);
        }
        
        selectedTile.classList.remove('selected');
        selectedTile = null;
    }
}

// 3. 타일 교환 로직
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

// 6. 매치 제거 및 보드 업데이트 (점수 및 효과 포함)
function handleMatches() {
    if (level > MAX_LEVEL) return; 

    let tilesToClear = new Set(); 
    let hasMatch = false;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const type = board[r][c];
            if (type === -1) continue; 

            // 가로 매치
            let hMatch = [];
            for (let i = c; i < BOARD_SIZE && board[r][i] === type; i++) {
                hMatch.push({r, c: i});
            }
            if (hMatch.length >= 3) {
                hMatch.forEach(coord => tilesToClear.add(`${coord.r},${coord.c}`));
                hasMatch = true;
            }

            // 세로 매치
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
        
        let pointsGained = tilesToClear.size * SCORE_PER_TILE;

        // ★★★ 피버 모드 시 점수 2배 적용 ★★★
        if (isFeverMode) {
            pointsGained *= 2; 
        }
        score += pointsGained;

        // ★★★ 피버 게이지 증가 로직 ★★★
        if (!isFeverMode) {
            feverGauge += tilesToClear.size * FEVER_INCREMENT;
            if (feverGauge > FEVER_MAX) {
                feverGauge = FEVER_MAX;
            }
            updateFeverGauge();
        }
        // ★★★ 피버 게이지 증가 로직 끝 ★★★


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


