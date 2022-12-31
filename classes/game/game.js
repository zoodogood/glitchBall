new CssIncluder( "classes/game/game.css" ).include();

const
  PULSE_SPEED      = 900,
  ROLLING_SPEED    = 250,
  BALL_MAX_RADIUS  = 190,
  BALL_MIN_RADIUS  = 90,
  EDGE_DISTANCE    = 10;


if ( BALL_MIN_RADIUS > BALL_MAX_RADIUS )
  throw new Error("Really? Max radius less than min radius");

if ( EDGE_DISTANCE + BALL_MAX_RADIUS > 200 )
  throw new Error("the size of the middle circle indented should not exceed 200 (radius of canvas Ball)");


class Game {
  #myFrame
  #timer
  #score

  constructor(canvasId){
    this.canvas = document.getElementById(canvasId);
    this.canvas.classList.add("game-canvas");

    this.height = canvas.height;
    this.width  = canvas.width;


    this.#applyListeners();

    this.ctx = this.canvas.getContext("2d");
    this.#myFrame = this.#frame.bind(this);
  }



  init(){
    requestAnimationFrame( this.#myFrame );

    // moving ball
    this.ball     = new Ball({ radius: BALL_MAX_RADIUS, x: 200, y: 200  });

    // largest area, canvas
    this.canvBall = new Ball({ radius: 200, x: 200, y: 200 });

    // display when the user's mouse is pressed down
    this.userBall = new Ball({ radius: 0 });

    this.#timer = null;
    this.over   = false;
    this.#score = 0;

    return this;
  }



  #frame(){
    if ( this.over )
      return;

    requestAnimationFrame( this.#myFrame );
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 400, 400);

    const ms = Date.now();

    if ( PULSE_SPEED )
      this.ball.radius = ( 0.5 + Math.cos(ms / PULSE_SPEED) / 2 ) * (BALL_MAX_RADIUS - BALL_MIN_RADIUS) + BALL_MIN_RADIUS;

    if ( ROLLING_SPEED ){
      this.ball.x = ( 1 + Math.cos(ms / ROLLING_SPEED) ) * (200 - EDGE_DISTANCE - this.ball.radius) + this.ball.radius + EDGE_DISTANCE;
      this.ball.y = ( 1 + Math.sin(ms / ROLLING_SPEED) ) * (200 - EDGE_DISTANCE - this.ball.radius) + this.ball.radius + EDGE_DISTANCE;
    }

    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.userBall.x, this.userBall.y, this.userBall.radius, 0, Math.PI * 2);
    ctx.fill();
  }



  #applyListeners(){
    this.canvas.addEventListener( "pointerdown", this.#clickHandle.bind(this) );
    this.canvas.addEventListener( "contextmenu", contextMenu => contextMenu.preventDefault() );
  }



  async #clickHandle(clickEvent){
    clickEvent.preventDefault();

    if (this.over)
      return;


    let ball = this.userBall;
    ball.setPosition( clickEvent.offsetX, clickEvent.offsetY );

    if ( this.#timer === null )
      this.#createTimer();


    let whenUpMouse = new Promise(res => this.canvas.addEventListener("pointerup", res, {once: true}))
      .then(() => whenUpMouse.up = true);

    this.ctx.fillStyle = "black";

    while ( !whenUpMouse.up ){
      ball.radius++;
      await delay(10);

      if ( ball.outsideOf( this.ball ) )
        this.ctx.fillStyle = "#ff0000";

      if ( !ball.outsideOf( this.ball ) )
        this.ctx.fillStyle = "#000000";

      if ( ball.outsideOf( this.canvBall ) )
        return this.#endHandler(false);

      this.#score += 1 + ball.radius / 100;
    }

    if ( ball.outsideOf( this.ball ) )
      return this.#endHandler(false);


    ball.radius = 0;
  }



  setTitleElement(querySelector){
    this.titleElement = document.querySelector(querySelector);
    return this;
  }



  #endHandler(hasWin){
    this.over = true;

    if (globalThis.recordScore < this.getScore())
      globalThis.recordScore = localStorage.recordScore = this.getScore();

    if ( typeof this.onEnd === "function" )
      this.onEnd(this, hasWin);
  }

  setEndHandler(callback){
    if ( typeof callback !== "function" )
      throw new Error("Callback must be a function");

    this.onEnd = callback;
    return this;
  }



  #createTimer(){
    this.#timer = 15.2;

    new Timeout((timer) => {
      if (this.over)
        return;

      if (this.#timer !== null && this.#timer <= 0){
        this.#endHandler(true);
        return;
      }

      const score = Math.floor( this.#score );
      const time  = this.#timer ?
        this.#timer.toFixed(1) :
        0;

      this.titleElement.innerHTML = `Счёт: <b>${ score }</b><br>Осталось времени: ${ time }`;

      this.#timer -= 0.1;
      timer.launch();
    }, 100);
  }


  getScore(){
    return Math.floor(this.#score);
  }

  getTime(){
    return this.#timer;
  }
}



class Ball {
  constructor({ radius = 10, x = 0, y = 0 }){
    this.x = x;
    this.y = y;
    this.radius = radius;
  }



  setPosition(x, y){
    this.x = x;
    this.y = y;
  }



  outsideOf( ball ){
    const distance = Math.sqrt( (ball.x - this.x) ** 2 + (ball.y - this.y) ** 2 );

    return distance + this.radius > ball.radius;
  }
}
