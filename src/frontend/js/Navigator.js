/**
 * Navigator class for holding arrow position;
 * Behavior of arrow is limited; Only 'down' navigation possible
 * on looking up and vice versa (otherwise no effect)
 * val holds integer value from 0-5:
 * 0 = ahead (default)
 * 1 = right
 * 2 = behind
 * 3 = left
 * 4 = up
 * 5 = down
 */
class Navigator {
    val = 0;
    min = null;
    max = null;
    cbFunc = null;
    context = null;
    prev = 0;

    constructor(min, max, cbFunc = null, context = null) {
        this.min = min;
        this.max = max;
        this.cbFunc = cbFunc;
        this.context = context;
    }

    //increment
    right() {
        this.val = this.val == this.max ? this.min : this.val + 1;
        if (this.cbFunc != null)
            this.cbFunc.call(this.context, this.val);
    }
    //decrement
    left() {
        this.val = this.val == this.min ? this.max : this.val - 1;
        if (this.cbFunc != null)
            this.cbFunc.call(this.context, this.val);
    }

    up() {
        if (this.val != 4) {
            if (this.val == 5) {
                this.val = this.prev;
            } else {
                this.prev = this.val;
                this.val = 4;
            }
            if (this.cbFunc != null)
                this.cbFunc.call(this.context, this.val);
        }



    }

    down() {

        if (this.val != 5) {
            if (this.val == 4) {
                this.val = this.prev;
            } else {
                this.prev = this.val;
                this.val = 5;
            }
            if (this.cbFunc != null)
                this.cbFunc.call(this.context, this.val);
        }
    }


}