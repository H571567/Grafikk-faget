"use strict";

/**
 * Controller for the cube project.
 */
class CubeController {

    /**
     * Creates a new CubeController object.
     */
    constructor() {
        this._model = new CubeData();
        this._view = new CubeGL(this._model);
    }

    /**
     * Changes the rotation axis.
     */
    xButtonClicked() {
        this._view.axis = X_AXIS;
    }

    /**
     * Changes the rotation axis.
     */
    yButtonClicked() {
        this._view.axis = Y_AXIS;
    }

    /**
     * Changes the rotation axis.
     */
    zButtonClicked() {
        this._view.axis = Z_AXIS;
    }

}


