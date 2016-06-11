var InputManager =
{
    LEFT_MOUSE_BUTTON: 1,
    MIDDLE_MOUSE_BUTTON: 2,
    RIGHT_MOUSE_BUTTON: 3,

    keys: [],
    oldKeys: [],

    update: function()
    {
        /* of course, I could make another array,
           holding the indexes, iterating trough them...
           but I don't know what's a better solution. */
        this.oldKeys = this.keys.splice();
    },

    keyDown: function( code )
    {
        this.keys[ code ] = true;
    },

    keyUp: function( code )
    {
        this.keys[ code ] = false;
    },

    isKeyDown: function( code )
    {
        return ( this.keys[ code ] === true );
    },

    isKeyPressed: function( code )
    {
        return ( this.keys[ code ] === true && this.oldKeys[ code ] !== true );
    },
};

document.onkeydown = function(evnt)
{
    InputManager.keyDown(evnt.keyCode);
};

document.onkeyup = function(evnt)
{
    InputManager.keyUp(evnt.keyCode);
};
