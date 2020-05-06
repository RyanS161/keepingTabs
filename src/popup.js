let workflows = [];
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['workflows'], result => {
    if (result['workflows']) {
      workflows = result['workflows'];
      printWorkflows();
    } else {
      workflows = [];
    }
  });

  let add = document.getElementById('tabAdder');
  add.addEventListener('click', () => {
    let title = document.getElementById('wfName').value;
    let flag = false;
    for (let x = 0; x < workflows.length; x++) {
      if (title === workflows[x].title) {
        flag = true;
      }
    }
    if(title == "" || title === " ") {
      document.getElementById('errorText').innerHTML = "Your tab group must be named";
    } else if (flag) {
      document.getElementById('errorText').innerHTML = "You tab group may not have duplicate names";
    } else {
      document.getElementById('errorText').innerHTML = "";
      chrome.tabs.query({highlighted:true}, tabs => {
        let dict = {"title" : title,
                    "pages" : [],};
        for (let x = 0; x < tabs.length; x++) {
          dict.pages.push({
            "title" : tabs[x].title,
            "url" : tabs[x].url,
          });
        }
        workflows.push(dict);
        chrome.storage.sync.set({'workflows' : workflows}, () => {});
      });
    }
    setTimeout(() => {
      document.getElementById('wfName').value = "";
      printWorkflows();
    }, 0);
  });
});


function assignButtons() {
  for (let x = 0; x < workflows.length; x++) {
    let delButton = document.getElementById('del' + workflows[x].title);
    delButton.addEventListener('click', () => {
      workflows = workflows.slice(0, x).concat(workflows.slice(x+1))
      chrome.storage.sync.set({'workflows' : workflows}, () => {});
      printWorkflows();
    });

    let openButton = document.getElementById('open' + workflows[x].title);
    openButton.addEventListener('click', () => {
      console.log(x);
      for (let y = 0; y < workflows[x].pages.length; y++) {
        chrome.tabs.create({ url : workflows[x].pages[y].url });
      }
    });
  }
  let openAllButton = document.getElementById('openAll');
  openAllButton.addEventListener('click', () => {
    for (let x = 0; x < workflows.length; x++) {
      for (let y = 0; y < workflows[x].pages.length; y++) {
        chrome.tabs.create({ url : workflows[x].pages[y].url });
      }
    }
  });
}
function printWorkflows() {
  let str = "";
  for (let x = 0; x < workflows.length; x++) {
    str += `<div class='workflow'>
              <div>
                <span class='title'>${workflows[x].title}</span>
                <a id='open${workflows[x].title}'><img class='openButton' src="icons/newWindow.svg"></a>
                <a id='del${workflows[x].title}'><img class='deleteButton' src="icons/trash.svg"></a>
              </div>`;
    for (let y = 0; y < workflows[x].pages.length; y++) {
      let title = (workflows[x].pages[y].title.length > 40)
      ? `${workflows[x].pages[y].title.slice(0, 41)}. . .` : `${workflows[x].pages[y].title}`;
      str += `<a class='link' href='${workflows[x].pages[y].url}'>${title}</a><br>`;
    }
    str += "</div>"
  }
  document.getElementById('addTo').innerHTML = str;
  assignButtons();
}
