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
  add.addEventListener('click', () => addTabs());

  let deleter = document.getElementById('tabDeleter');
  deleter.addEventListener('click', () => {
    if(addTabs()) {
      chrome.tabs.query({highlighted:true, currentWindow:true}, tabs => {
        let ids = []
        for (let x in tabs) {
          ids.push(tabs[x].id);
          console.log(ids);
        }
        chrome.tabs.remove(ids);
      });
    }
  });
});

function addTabs() {
  let title = document.getElementById('wfName').value;
  let flag = false;
  for (let x = 0; x < workflows.length; x++) {
    if (title === workflows[x].title) {
      flag = true;
    }
  }
  if(title == "" || title === " ") {
    document.getElementById('errorText').innerHTML = "Your tab group must be named";
    return false;
  } else if (flag) {
    document.getElementById('errorText').innerHTML = "Your tab group may not have duplicate names";
    return false;
  } else {
    document.getElementById('errorText').innerHTML = "";
    chrome.tabs.query({highlighted:true, currentWindow:true}, tabs => {
      let dict = {"title" : title,
                  "pages" : [],
                  "displayed" : true,};
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
  return true;
}


function assignButtons() {
  for (let x = 0; x < workflows.length; x++) {
    let addButton = document.getElementById('add' + workflows[x].title);
    addButton.addEventListener('click', () => {
      chrome.tabs.query({highlighted:true, currentWindow:true}, tabs => {
        for (let y = 0; y < tabs.length; y++) {
          workflows[x].pages.push({
            "title" : tabs[y].title,
            "url" : tabs[y].url,
          });
        }
        chrome.storage.sync.set({'workflows' : workflows}, () => {});
      });
      setTimeout(() => printWorkflows(), 0);
    });

    let openButton = document.getElementById('open' + workflows[x].title);
    openButton.addEventListener('click', () => {
      for (let y = 0; y < workflows[x].pages.length; y++) {
        chrome.tabs.create({ url : workflows[x].pages[y].url });
      }
    });

    let delButton = document.getElementById('del' + workflows[x].title);
    delButton.addEventListener('click', () => {
      workflows = workflows.slice(0, x).concat(workflows.slice(x+1));
      chrome.storage.sync.set({'workflows' : workflows}, () => {});
      printWorkflows();
    });

    let displayButton = document.getElementById('display' + workflows[x].title);
    if (displayButton != null) {
      displayButton.addEventListener('click', () => {
        workflows[x].displayed = true;
        printWorkflows();
        chrome.storage.sync.set({'workflows' : workflows}, () => {});
      });
    }

    let hideButton = document.getElementById('hide' + workflows[x].title);
    if (hideButton != null) {
      hideButton.addEventListener('click', () => {
        workflows[x].displayed = false;
        printWorkflows();
        chrome.storage.sync.set({'workflows' : workflows}, () => {});
      });
    }

    for (let y = 0; y < workflows[x].pages.length; y++) {
      let link = document.getElementById('link' + workflows[x].pages[y].url);
      let deleteLink = document.getElementById('delete' + workflows[x].pages[y].url);
      if (link != null) {
        link.addEventListener('click', () => {
          chrome.tabs.create({ url : workflows[x].pages[y].url });
        });
        deleteLink.addEventListener('click', () => {
          workflows[x].pages = workflows[x].pages.slice(0, y).concat(workflows[x].pages.slice(y+1))
          if (workflows[x].pages.length == 0) {
            workflows = workflows.slice(0, x).concat(workflows.slice(x+1));
          }
          chrome.storage.sync.set({'workflows' : workflows}, () => {});
          printWorkflows();
        });
      }
    }
  }
}
function printWorkflows() {
  let str = "";
  for (let x = 0; x < workflows.length; x++) {
    str += `<div class='workflow'>
              <div>
                <span class='title openButton' id='open${workflows[x].title}'>${workflows[x].title}</span>
                <a id='add${workflows[x].title}'><img class='addButton' src="icons/plus.svg" title="Add current tab"></a>
                <a id='del${workflows[x].title}'><img class='deleteButton' src="icons/trash.svg"></a>`
    if (workflows[x].displayed == true) {
      str += `<a id='hide${workflows[x].title}'><img class='hideButton' src="icons/caret_down.svg"></a>`;
    } else {
      str += `<a id='display${workflows[x].title}'><img class='displayButton' src="icons/caret_right.svg"></a>`;
    }
    str += `</div>`;
    if (workflows[x].displayed == true) {
      for (let y = 0; y < workflows[x].pages.length; y++) {
        let title = (workflows[x].pages[y].title.length > 40)
        ? `${workflows[x].pages[y].title.slice(0, 41)}. . .` : `${workflows[x].pages[y].title}`;
        str += `<a class='link' id='link${workflows[x].pages[y].url}'>${title}</a>
        <a id='delete${workflows[x].pages[y].url}'><img class='deleteButton2' src="icons/wx.svg"></a><br>`;
      }
    }
    str += "</div>"
  }
  document.getElementById('addTo').innerHTML = str;
  assignButtons();
}
