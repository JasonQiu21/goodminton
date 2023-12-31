<a name="readme-top"></a>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/JasonQiu21/goodminton">
    <img src="public/images/cat.jpg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Goodminton</h3>

  <p align="center">
    Welcome to Goodminton your go-to destination for hassle-free badminton experiences! Easily book courts at top venues, participate in thrilling tournaments, and connect with a vibrant badminton community. Enjoy the convenience of anytime, anywhere access to elevate your game. Goodminton where convenience meets competition for the ultimate badminton bliss!
  </p>
</div>


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```
* MongoDB
<a href="https://www.mongodb.com/docs/manual/administration/install-community/">
  - Follow the instructions on the MongoDB website for installing the community edition
</a>

### Installation

1. Start up the MongoDB server on port 27017
2. Clone the repo
   ```sh
   git clone https://github.com/JasonQiu21/goodminton.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Seed some sample data into the database.
   ```sh
   npm run seed
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Register an account here: http://localhost:3000/register
<br />
Or sign-in with some of the sample accounts:
<br />
Admin username: `jqiu21@stevens.edu`
<br />
Admin password: `password1`
<br />
(admin accounts can create events)
<br />

Normal username:  `phill@stevens.edu`
<br />
Normal password:  `password12`
<br />

All features can be accessed through the navigation bar at the top.
<br />

Some sample features that users can do:
<br/>
You can reserve for events (practices/tournaments) if you are signed in
<br/>
View/create/edit prfiles
<br/>

Some sample features that admins can do:
<br/>
Create/start events (create brackets for tournament, we have round robin and swiss styles)
<br/>
Inputting scores for tournaments
<br/>

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
