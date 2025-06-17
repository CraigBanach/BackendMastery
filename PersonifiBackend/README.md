# Personifi Backend

## Design Decisions

### Users

Currently, there is no backing system that stores users or user data. We treat the user sub from the JWT as the user ID. This means that there is no easy way to track this user across multiple login methods (social, user/pass, magic link etc.). It's a fine solution for the time being, but ultimately I'd like for the system to be account based, with multiple users (so that a couple can login independently) that can access a single account.

For the time being, I'm just going to use the user sub as the user ID & change this implementation later.