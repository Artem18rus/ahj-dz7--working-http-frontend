/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
const container = document.querySelector('.container');
let containerItem = document.querySelectorAll('.container-item');
const addTicket = document.querySelector('.add-ticket');
const body = document.querySelector('body');
const radioBtn = document.querySelectorAll('.radio-btn');
let modalCreateTicket = document.querySelector('.modalCreateTicket');

class TicketsList {
  // загрузка тикетов с сервера:
  static download() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      const data = JSON.parse(xhr.responseText);
      TicketsList.funcAfterDownload(data);
      TicketsList.openDescription();
      TicketsList.createTicketMethod();
      TicketsList.statusMethod();
      TicketsList.deleteTicked();
      TicketsList.editTicketMethod();
    };
    xhr.open('GET', 'http://localhost:7070');
    xhr.send();
  }

  // вставка загруженных с сервера тикетов:
  static funcAfterDownload(data) {
    for (let i = 0; i < data.length; i += 1) {
      container.insertAdjacentHTML('beforeend', `
        <div class="container-item">
          <div class="radio-btn">
            <div class="circle"></div>
          </div>
          <div class="name-description">
            <div class="name">${data[i].name}</div>
            <div class="description descriptionActive">${data[i].description}</div>
          </div>
          <div class="date-time">${data[i].created}</div>
          <div class="action">
            <div class="edit-btn pencil"></div>
            <div class="close-btn cross"></div>
          </div>
        </div>
      `);
    }
  }

  // обработка отображения подробного описания:
  static openDescription() {
    const names = document.querySelectorAll('.name');
    names.forEach((item) => {
      item.addEventListener('click', (e) => {
        const descriptionNew = item.parentElement.querySelector('.description');
        descriptionNew.classList.toggle('descriptionActive');
      });
    });
  }

  // обработка модального окна добавления тикета
  static createTicketMethod() {
    // появление модального окна при клике по кнопке "Добавить тикет":
    addTicket.addEventListener('click', () => {
      body.insertAdjacentHTML('beforeend', `
        <form class="modalCreateTicket">
          <span class="header">Добавить тикет</span>
          <div class="short-description">
            <p>Краткое описание:</p>
            <textarea name="name" id="text" rows="1" value=""></textarea>
          </div>
          <div class="detailed-description">
            <p>Подробное описание:</p>
            <textarea name="description" id="text" rows="7" value=""></textarea>
          </div>
          <div class='modal-list-btn'>
            <button type="button" class='btn-cancel'>Отмена</button>
            <button type="submit" class='btn-ok-submit'>Ок</button>
          </div>
        </form>
      `);
      TicketsList.closeBtnPointEventsNone();
      TicketsList.circlePointEventsNone();
      TicketsList.btnCancel();
      TicketsList.btnOkSubmit();
    });
  }

  static closeBtnPointEventsNone() {
    const closeBtnPointEvents = document.querySelectorAll('.close-btn');
    closeBtnPointEvents.forEach((item) => {
      item.style.pointerEvents = 'none';
    });
  }

  static circlePointEventsNone() {
    const circlePointEvents = document.querySelectorAll('.circle');
    circlePointEvents.forEach((item) => {
      item.style.pointerEvents = 'none';
    });
  }

  static closeBtnPointEventsAuto() {
    const closeBtnPointEvents = document.querySelectorAll('.close-btn');
    closeBtnPointEvents.forEach((item) => {
      item.style.pointerEvents = 'auto';
    });
  }

  static circlePointEventsAuto() {
    const circlePointEventsAuto = document.querySelectorAll('.circle');
    circlePointEventsAuto.forEach((item) => {
      item.style.pointerEvents = 'auto';
    });
  }

  // обработка кнопки Отмена модального окна:
  static btnCancel() {
    const btnCancel = document.querySelector('.btn-cancel');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        modalCreateTicket = document.querySelector('.modalCreateTicket');
        modalCreateTicket.remove();

        TicketsList.closeBtnPointEventsAuto();
        TicketsList.circlePointEventsAuto();
      });
    }
  }

  // обработка Кнопки Ок модального окна:
  static btnOkSubmit() {
    modalCreateTicket = document.querySelector('.modalCreateTicket');
    if (modalCreateTicket) {
      modalCreateTicket.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('dfffffff');
        const bodySubmit = Array.from(modalCreateTicket.elements)
          .filter(({ name }) => name)
          .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
          .join('&');
          // console.log(bodySubmit)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:7070/?method=createTicket');
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const newData = data[data.length - 1];
              // console.log(data)
              container.insertAdjacentHTML('beforeend', `
               <div class="container-item">
                <div class="radio-btn">
                  <div class="circle"></div>
                </div>
                <div class="name">${newData.name}</div>
                <div class="date-time">${newData.created}</div>
                <div class="action">
                  <div class="edit-btn pencil"></div>
                  <div class="close-btn cross"></div>
                </div>
              </div>
            `);
              location.reload();
              modalCreateTicket.remove();
            } catch (err) {
              console.error(err);
            }
          }
        });
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(bodySubmit);

        TicketsList.closeBtnPointEventsAuto();
        TicketsList.circlePointEventsAuto();
      });
    }
  }

  // обработка статуса тикета (есть галочка или нет?):
  static statusMethod() {
    const circleArray = document.querySelectorAll('.circle');
    if (circleArray) {
      circleArray.forEach((item, idx) => {
        item.addEventListener('click', (e) => {
          e.target.classList.toggle('check');

          e.preventDefault();
          if (item.classList.contains('check')) {
            const bodySubmit = `${idx}`;
            const xhr = new XMLHttpRequest();
            xhr.open('PATCH', 'http://localhost:7070/?method=checkmarkTrue');
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  console.log(data);
                } catch (err) {
                  console.error(err);
                }
              }
            });
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(bodySubmit);
          } else {
            const bodySubmit = `${idx}`;
            const xhr = new XMLHttpRequest();
            xhr.open('PATCH', 'http://localhost:7070/?method=checkmarkFalse');
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  console.log(data);
                } catch (err) {
                  console.error(err);
                }
              }
            });
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(bodySubmit);
          }
        });

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          const data = JSON.parse(xhr.responseText);
          if (data[idx].status === true) {
            item.classList.add('check');
          } else {
            item.classList.remove('check');
          }
        };
        xhr.open('GET', 'http://localhost:7070');
        xhr.send();
      });
    }
  }

  // обработка удаления тикета (нажатие на крестик):
  static deleteTicked() {
    const closeBtn = document.querySelectorAll('.close-btn');
    closeBtn.forEach((item, idx) => {
      item.addEventListener('click', () => {
        const modalDeleteTicket = document.querySelector('.modalDeleteTicket');
        if (modalDeleteTicket === null) {
          body.insertAdjacentHTML('beforeend', `
        <div class="modalDeleteTicket">
          <span class="header">Удалить тикет</span>
          <div class="warningDelTicket">
            <p>Вы уверены, что хотите удалить тикет? Это действие необратимо.</p>
          </div>
          <div class='modal-list-btn'>
            <button type="button" class='btn-cancel'>Отмена</button>
            <button type="submit" class='btn-ok-submit'>Ок</button>
          </div>
        </div>
      `);

          addTicket.style.pointerEvents = 'none';
          TicketsList.circlePointEventsNone();

          // обработка нажатия на кнопку 'Отмена' модального окна удаления тикета:
          const btnCancel = document.querySelector('.btn-cancel');
          btnCancel.onclick = function f() {
            const modalDeleteTicket = document.querySelector('.modalDeleteTicket');
            modalDeleteTicket.remove();

            addTicket.style.pointerEvents = 'auto';
            TicketsList.circlePointEventsAuto();
          };

          // обработка нажатия на кнопку 'Ок' модального окна удаления тикета:
          const btnOkSubmit = document.querySelector('.btn-ok-submit');
          btnOkSubmit.onclick = function f() {
            const bodySubmit = `${idx}`;
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', `http://localhost:7070/?method=deleteTicked${bodySubmit}`);
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  console.log(data);
                } catch (err) {
                  console.error(err);
                }
              }
            });
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send();

            item.closest('.container-item').remove();
            const modalDeleteTicket = document.querySelector('.modalDeleteTicket');
            modalDeleteTicket.remove();

            addTicket.style.pointerEvents = 'auto';
            TicketsList.circlePointEventsAuto();
          };
        }
      });
    });
  }

  // обработка изменения тикета (нажатие на карандаш):
  static editTicketMethod() {
    const editBtn = document.querySelectorAll('.edit-btn');
    editBtn.forEach((item, idx) => {
      item.addEventListener('click', () => {
        let modalEditTicket = document.querySelector('.modalEditTicket');
        const modalCreateTicket = document.querySelector('.modalCreateTicket');
        const modalDeleteTicket = document.querySelector('.modalDeleteTicket');

        if (modalEditTicket === null && modalCreateTicket === null && modalDeleteTicket === null) {
          body.insertAdjacentHTML('beforeend', `
          <form class="modalEditTicket">
          <span class="header">Изменить тикет</span>
          <div class="short-description">
            <p>Краткое описание:</p>
            <textarea name="name" id="text" rows="1" value=""></textarea>
          </div>
          <div class="detailed-description">
            <p>Подробное описание:</p>
            <textarea name="description" id="text" rows="7" value=""></textarea>
          </div>
          <div class='modal-list-btn'>
            <button type="button" class='btn-cancelEditModal'>Отмена</button>
            <button type="submit" class='btn-ok-submitEditModal'>Ок</button>
          </div>
        </form>
        `);
        }

        addTicket.style.pointerEvents = 'none';
        TicketsList.closeBtnPointEventsNone();
        TicketsList.circlePointEventsNone();

        // обработка нажатия на кнопку 'Отмена' модального окна изменения тикета:
        const btnCancelEditModal = document.querySelector('.btn-cancelEditModal');
        btnCancelEditModal.onclick = function f() {
          const modalEditTicket = document.querySelector('.modalEditTicket');
          modalEditTicket.remove();

          addTicket.style.pointerEvents = 'auto';
          TicketsList.closeBtnPointEventsAuto();
          TicketsList.circlePointEventsAuto();
        };

        // обработка нажатия на кнопку 'Ок' модального окна изменения тикета:
        modalEditTicket = document.querySelector('.modalEditTicket');
        if (modalEditTicket) {
          modalEditTicket.addEventListener('submit', (e) => {
            e.preventDefault();

            const bodySubmit = Array.from(modalEditTicket.elements)
              .filter(({ name }) => name)
              .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
              .join('&');

            const xhr = new XMLHttpRequest();
            xhr.open('PATCH', `http://localhost:7070/?method=editTicket${idx}`);
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  containerItem = document.querySelectorAll('.container-item');

                  const editName = containerItem[idx].querySelector('.name');
                  editName.textContent = data[idx].name;
                  const editDescription = containerItem[idx].querySelector('.description');
                  editDescription.textContent = data[idx].description;

                  modalEditTicket.remove();
                } catch (err) {
                  console.error(err);
                }
              }
            });
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(bodySubmit);

            addTicket.style.pointerEvents = 'auto';
            TicketsList.closeBtnPointEventsAuto();
            TicketsList.circlePointEventsAuto();
          });
        }
      });
    });
  }
}
TicketsList.download();
