import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/point-model.js';
import FiltersModel from './model/filters-model.js';

const siteBody = document.querySelector('.page-body');
const headerMain = siteBody.querySelector('.trip-main');
const siteFilters = siteBody.querySelector('.trip-controls__filters');
const siteContainer = siteBody.querySelector('.trip-events');

const pointModels = new PointModel();
const filtersModel = new FiltersModel();

const pagePresenter = new Presenter({
  mainContainer: siteContainer,
  pointModels,
  filtersModel,
  headerMain,
});

const filterPresenter = new FilterPresenter({
  filtersContainer: siteFilters,
  filtersModel: filtersModel,
  pointsModel: pointModels,
  presenter: pagePresenter,
});

pagePresenter.init();
filterPresenter.init();
