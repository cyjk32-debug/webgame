const BOARD_SIZE = 8; // 보드의 크기 (8x8)
const NUM_GEMS = 5; // 보석 종류 수 (0부터 4까지)
const gameBoard = document.getElementById('game-board');

let board = [];
let selectedTile = null;

// 게임 상태 변수
let score = 0;
let level = 1;
const MAX_LEVEL = 10;
const LEVEL_SCORE_INCREMENT = 500; // 단계별 필요 점수
const SCORE_PER_TILE = 10; // 타일 한 개 제거당 얻는 점수
let targetScore = 0;

// 보석 종류 (이모지)
const GEMS = ['🎅', '🤶', '🤶🏿', '🧦', '🎄'];

// 사운드 객체
const matchSound = new Audio('match.mp3'); 
// 💡 주의: 'match.mp3' 파일이 같은 폴더에 있어야 사운드가 재생됩니다.

// ★★★ 추가된 승리 사운드 객체 ★★★
const levelUpSound = new Audio('levelup.mp3'); 
// 💡 주의: 'levelup.mp3' 파일이 이 코드가 있는 폴더에 있어야 합니다! 
// 사운드 파일을 구할 수 없는 경우 이 줄을 주석 처리하거나 다른 URL을 사용해야 합니다.
// ★★★ 추가된 승리 사운드 객체 끝 ★★★

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

// 3. 타일 교환 로직
function trySwap(tile1, tile2) {
    const r1 = parseInt(tile1.dataset.row);
    const c1 = parseInt(tile1.dataset.col);
    const r2 = parseInt(tile2.dataset.row);
    const c2 = parseInt(tile2.dataset.col);

    // 모델(board 배열)에서 값 교환
    [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];

    // 매치가 발생했는지 확인
    if (checkMatch(board, r1, c1) || checkMatch(board, r2, c2)) {
        // 매치가 성공하면 시각적으로도 교환
        [tile1.textContent, tile2.textContent] = [tile2.textContent, tile1.textContent];
        
        // 매치 제거 및 보드 업데이트
        setTimeout(() => {
            handleMatches();
        }, 100); 
    } else {
        // 매치가 없으면 모델(board 배열)을 다시 원래대로 되돌림
        [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
        console.log("매치가 발생하지 않아 되돌립니다.");
    }
}

// 4. 매치 확인
function checkMatch(currentBoard, r, c) {
    const type = currentBoard[r][c];
    
    // 가로 매치 확인
    let horizontal = 1;
    for (let i = c + 1; i < BOARD_SIZE && currentBoard[r][i] === type; i++) horizontal++;
    for (let i = c - 1; i >= 0 && currentBoard[r][i] === type; i--) horizontal++;

    // 세로 매치 확인
    let vertical = 1;
    for (let i = r + 1; i < BOARD_SIZE && currentBoard[i][c] === type; i++) vertical++;
    for (let i = r - 1; i >= 0 && currentBoard[i][c] === type; i--) vertical++;

    return horizontal >= 3 || vertical >= 3;
}

// 5. 단계 상승 확인
function checkLevelUp() {
    if (level < MAX_LEVEL && score >= targetScore) {
        // ★★★ 승리 사운드 재생 ★★★
        levelUpSound.play().catch(e => console.log("승리 사운드 재생 실패:", e));
        // ★★★ 승리 사운드 재생 끝 ★★★
        
        level++;
        targetScore = level * LEVEL_SCORE_INCREMENT; 
        alert(`🎉 축하합니다! ${level} 단계로 올라갔습니다!\n다음 목표 점수: ${targetScore}`);
        updateGameInfo();
        handleMatches(); 
    } else if (level === MAX_LEVEL && score >= targetScore) {
        // ★★★ 최종 승리 사운드 재생 ★★★
        levelUpSound.play().catch(e => console.log("최종 승리 사운드 재생 실패:", e));
        // ★★★ 최종 승리 사운드 재생 끝 ★★★
        
        level++; 
        alert("🎊 최고 레벨(10단계) 목표 점수 달성! 게임 클리어!");
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

    // 전체 보드를 순회하며 매치 찾기
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const type = board[r][c];
            if (type === -1) continue; 

            // 가로 매치 찾기
            let hMatch = [];
            for (let i = c; i < BOARD_SIZE && board[r][i] === type; i++) {
                hMatch.push({r, c: i});
            }
            if (hMatch.length >= 3) {
                hMatch.forEach(coord => tilesToClear.add(`${coord.r},${coord.c}`));
                hasMatch = true;
            }

            // 세로 매치 찾기
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
        // 사운드 재생
        matchSound.play().catch(e => console.log("사운드 재생 실패:", e));
        
        // 점수 획득
        const pointsGained = tilesToClear.size * SCORE_PER_TILE;
        score += pointsGained;
        updateGameInfo(); 

        // 1. DOM에서 매치된 타일 제거 시각화 (애니메이션 적용)
        tilesToClear.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const tileElement = gameBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (tileElement) {
                tileElement.classList.add('clearing'); // 애니메이션 클래스 추가
                board[r][c] = -1; 
            }
        });

        // 2. 타일 떨어뜨리기 및 빈칸 채우기 (애니메이션 후 실행)
        setTimeout(() => {
            dropAndRefill();
            checkLevelUp(); 
        }, 300); 
    }
}

// 7. 타일 떨어뜨리기 및 빈칸 채우기
function dropAndRefill() {
    let tilesNeedUpdate = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tileElement = gameBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);

            if (board[r][c] === -1) {
                const newGemType = Math.floor(Math.random() * NUM_GEMS);
                board[r][c] = newGemType;
                
                if (tileElement) {
                    tileElement.classList.remove('clearing'); // 클래스 제거
                    tileElement.textContent = GEMS[newGemType];
                }
                tilesNeedUpdate = true;
            } else {
                // 빈칸이 아니어도 clearing 클래스가 남아있을 수 있으므로 제거
                if(tileElement) {
                   tileElement.classList.remove('clearing');
                }
            }
        }
    }
}

// 게임 시작

initBoard();
