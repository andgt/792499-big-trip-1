import Sorting from './../view/sorting.js';
import NoPoints from './../view/no-points.js';
import {render} from './../framework/render.js';
import PointPresenter from './point-presenter.js';

export default class Presenter {
  #mainContainer = null;
  #pointModels = null;

  #presenterPoints = [];
  #pointsCollection = new Map();

  constructor({mainContainer, pointModels}) {
    this.#mainContainer = mainContainer;
    this.#pointModels = pointModels;
  }

  #renderBoard() {
    for (let i = 0; i < this.#presenterPoints.length; i++) {
      this.#renderPoints(this.#presenterPoints[i]);
    }
  }

  init() {
    this.#presenterPoints = [...this.#pointModels.getPoints()];
    this.#renderSorting();
    this.#renderBoard();

    if (this.#presenterPoints.length === 0) {
      render(new NoPoints(), this.#mainContainer);
    }
  }

  #renderSorting() {
    render(new Sorting(), this.#mainContainer);
  }

  #renderPoints(point) {
    const pointPresenter = new PointPresenter({container: this.#mainContainer});
    pointPresenter.init(point);
    this.#pointsCollection.set(point.id, pointPresenter);
  }
}
