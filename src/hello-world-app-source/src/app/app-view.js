import {ViewStream} from 'spyne';

export class AppView extends ViewStream {

  constructor(props = {}) {
    props.tagName='main';
    props.id='app-main';
    props.class='main';
    super(props);
  }

  addActionListeners() {
    // return nexted array(s)
    return [];
  }

  
  broadcastEvents() {
    // return nexted array(s)
    return [];
  }

  addHelloWorld(e){
    const helloWorldView = new ViewStream({
      tagName: 'h2',
      "style": "color:#1F2933; padding: 2rem; font-family:sans-serif;",
      data: "Hello World"
    });

    this.appendView(helloWorldView);
  }


  onRendered() {
    this.addHelloWorld();
  }

}
