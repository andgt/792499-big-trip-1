import {humanizePointDueDate} from './../utils/points.js';
import {OFFERS, EVENT_TYPES, OFFER_TYPES, CITIES, DESTINATION_CITIES} from './../const.js';
import {capitalize} from './../utils/common.js';
import AbstractStatefulView from './../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {isEscapeKey} from './../utils/common.js';

const createEditPoint = (point) => {
  const {basePrice, event, dateFrom, dateTo, isEventType, isOffers, isCity, isDescription, isPictures} = point;
  const {offers} = isOffers;

  const createImgMarkup = (dataMarkup) => Object.entries(dataMarkup).map(([, value]) => `<img class="event__photo" src="${value.src}.jpg" alt="${value.description}">`).join('');
  const createMarkup = (dataMarkup) => Object.entries(dataMarkup).map(([, value]) => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${value.id}" type="checkbox" name="${value.title}" checked>
        <label class="event__offer-label" for="event-offer-${value.id}">
          <span class="event__offer-title">${value.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${value.price}</span>
        </label>
      </div>`).join('');
  const createEventType = (pointEvent, eventTypes) => eventTypes.map((type) =>
    `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${pointEvent === type ? 'checked' : ' '}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalize(type)}</label>
    </div>`).join('');
  const createCities = (cities) => cities.map((city) => `<option value="${city}"></option>`).join('');

  return `<form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${isEventType}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${createEventType(event, EVENT_TYPES)}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${isEventType}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${isCity}" list="destination-list-1">
        <datalist id="destination-list-1">
          ${createCities(CITIES)}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizePointDueDate(dateFrom).allDate}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizePointDueDate(dateTo).allDate}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
      ${(offers.length > 0 ? `
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>

          <div class="event__available-offers">
            ${createMarkup(offers)}
          </div>
        </section>` : ' ')}

      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${isDescription}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${createImgMarkup(isPictures)}
          </div>
        </div>
      </section>
    </section>
  </form>`;
};

export default class EditForm extends AbstractStatefulView {
  #handlerFormClick = null;
  #handlerFormReset = null;
  #datepickerStart = null;
  #datepickerEnd = null;
  #point = null;

  constructor({point, onFormSubmit, onFormReset}) {
    super();
    this.#point = point;
    this._setState(EditForm.parsePointToState(point));
    this.#handlerFormClick = onFormSubmit;
    this.#handlerFormReset = onFormReset;
  }

  get rollupBtn() {
    return this.element.querySelector('.event__rollup-btn');
  }

  get currentForm() {
    return this.element;
  }

  get eventTypeGroup() {
    return this.element.querySelector('.event__type-group');
  }

  get eventTypeCity() {
    return this.element.querySelector('.event__input--destination');
  }

  get template() {
    return createEditPoint(this._state);
  }

  _removeDatepicker() {
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  _restoreHandlers() {
    this.currentForm.addEventListener('submit', this.#handlerBtnSubmit);
    this.rollupBtn.addEventListener('click', this.#handlerResetForm);
    this.eventTypeGroup.addEventListener('change', this.#handlerEventType);
    this.eventTypeCity.addEventListener('change', this.#handlerDestinationPoint);
  }

  #handlerRemoveElements = () => {
    this.#handlerFormReset();
    document.removeEventListener('keydown', this._handlerEscResetForm);
  };

  #handlerBtnSubmit = () => {
    this.updateElement(this._state.isOffers.offers = this.#creatingActualOffers());
    this.#handlerFormClick(EditForm.parseStateToPoint(this._state));
    this.#handlerRemoveElements();
    this._removeDatepicker();
  };

  _handlerEscResetForm = (evt) => {
    if (isEscapeKey(evt) && this.isOpen && !evt.target.classList.contains('event__input--time')) {
      evt.preventDefault();
      this.#handlerResetForm();
    }
  };

  #handlerResetForm = () => {
    this.updateElement(EditForm.parsePointToState(this.#point));
    this.#handlerRemoveElements();
  };

  #handlerEventType = (evt) => {
    this._removeDatepicker();
    if (evt.target.classList.contains('event__type-input')) {
      evt.preventDefault();
      this.updateElement({
        isEventType: evt.target.value,
        isOffers: OFFER_TYPES.find((item) => item.type === evt.target.value),
      });
    }
    this._setDatepicker();
  };

  #handlerDestinationPoint = (evt) => {
    this._removeDatepicker();
    evt.preventDefault();
    DESTINATION_CITIES.find((item) => {
      if (item.name === evt.target.value) {
        this.updateElement({
          isCity: item.name,
          isDescription: item.description,
          isPictures: item.pictures,
        });
      }
    });
    this._setDatepicker();
  };

  #handlerOfferChecked = () => Array.from(this.element.querySelectorAll('.event__offer-checkbox')).
    filter((item) => item.checked).
    map((item) => item.getAttribute('id').at(-1));

  #creatingActualOffers = () => {
    const currentOffers = [];
    this.#handlerOfferChecked().forEach((el) => {
      currentOffers.push(OFFERS.find((item) => item.id === Number(el)));
    });
    return currentOffers;
  };

  #handlerDateFromChange = ([selectedDate]) => {
    this._state.dateFrom = humanizePointDueDate(selectedDate).datepicker;
    this.#datepickerEnd.set('minDate', humanizePointDueDate(this._state.dateFrom).allDate);
  };

  #handlerDateToChange = ([selectedDate]) => {
    this._state.dateTo = humanizePointDueDate(selectedDate).datepicker;
    this.#datepickerStart.set('maxDate', humanizePointDueDate(this._state.dateTo).allDate);
  };

  _setDatepicker() {
    const [inputStartTime, inputEndTime] = this.element.querySelectorAll('.event__input--time');
    this.#datepickerStart = flatpickr(inputStartTime, {
      enableTime: true,
      'time_24hr': true,
      dateFormat: 'y/m/d H:i',
      minDate: humanizePointDueDate(this._state.dateFrom).allDate,
      maxDate: humanizePointDueDate(this._state.dateTo).allDate,
      locale: {
        firstDayOfWeek: 1,
      },
      onClose: this.#handlerDateFromChange,
    });

    this.#datepickerEnd = flatpickr(inputEndTime, {
      enableTime: true,
      'time_24hr': true,
      dateFormat: 'y/m/d H:i',
      minDate: humanizePointDueDate(this._state.dateTo).allDate,
      locale: {
        firstDayOfWeek: 1,
      },
      onClose: this.#handlerDateToChange,
    });
  }

  static parsePointToState(point) {
    return {
      ...point,
      isEventType: point.event,
      isOffers: point.offer,
      isCity: point.destination.name,
      isDescription: point.destination.description,
      isPictures: point.destination.pictures,
    };
  }

  static parseStateToPoint(state) {
    const point = {...state};

    point.event = state.isEventType;
    point.img = state.isEventType;
    point.offer = state.isOffers;
    point.destination.name = state.isCity;
    point.destination.description = state.isDescription;
    point.destination.pictures = state.isPictures;

    delete point.isEventType;
    delete point.isOffers;
    delete point.isCity;
    delete point.isDescription;
    delete point.isPictures;
    return point;
  }
}
