# Mold


## Hooks Middleware

To prevent processing further hooks just throw MoldError:

    throw new MoldError(code, message);

Code can be http status or some other code.
Message is optional.
