new CssIncluder( "classes/game/game.css" ).include();
new CssIncluder( "main.css" ).include();

new Game("canvas")
  .setTitleElement("#title")
  .setEndHandler(async (game, hasWin) => {
    globalThis.hiding.setContent( takeHidingContent() );

    game.ctx.clearRect(0, 0, 400, 400);
    game.titleElement.innerHTML = `<span class = "increased-font">${ hasWin ? `<b>Счёт: ${ game.getScore() }</b><br>Время вышло.` : `<b>Счёт: ${ game.getScore() }</b><br><small>Игра окончена. Я без понятия почему Вы решили проиграть . . .</small>`}</span>`;
    game.canvas.classList.add("restarted");

    await new Promise(res => game.canvas.addEventListener("pointerup", res, { once: true }));
    game.canvas.classList.remove("restarted");
    game.titleElement.textContent = "Пуск!";
    game.init();
  })
  .init();


globalThis.recordScore = +localStorage.getItem("recordScore") || 0;




const takeHidingContent = () =>
`<b>Привет! Правила игры:</b>
1. Как только вы кликните посередине поля, запустится таймер.
2. За 15.2с Вам нужно заработать как можно больше очков, не проиграв.
3. Очки можно получить заполняя область среднего круга (того, который движется)
Для заполнения <span>зажмите левую кнопку мыши</span> внутри него.
4. Если Вы заполнили область за пределами этого круга — проиграли.
${ globalThis.recordScore ? `R) Ваш Рекорд: ${ globalThis.recordScore }` : ""}`;

globalThis.hiding = new HidingInfo("#getInfo")
.setContent( takeHidingContent() );
