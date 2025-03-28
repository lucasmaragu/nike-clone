Nike Clone 🏃‍♂️👟
==================

Welcome to the Nike Clone project! This application is a replica of the official Nike website, developed using Angular. It features authentication via JWT, image storage in a Supabase bucket, and utilizes PostgreSQL for managing products, shopping cart, and purchase data.

**Note:** All images used in this project are official Nike images and are not owned by me.

Table of Contents 📖
--------------------

-   Features

-   Prerequisites

-   Installation

-   Configuration

-   Running the Application

-   Usage

-   Contributing

-   License

Features ✨
----------

-   **User Authentication:** Secure login and registration using JSON Web Tokens (JWT).

-   **Product Management:** Browse and view detailed information about various products.

-   **Shopping Cart:** Add products to the cart and manage quantities.

-   **Purchases:** Complete purchases and view order history.

-   **Image Storage:** All product images are stored in a Supabase bucket.

-   **Database:** PostgreSQL is used to manage all product, cart, and purchase data.

Prerequisites 🛠️
-----------------

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (version 14 or higher)

-   [Angular CLI](https://angular.dev/tools/cli) (version 19.1.4)

-   [PostgreSQL](https://www.postgresql.org/) (for database management)

-   [Supabase Account](https://supabase.io/) (for image storage)

Installation 📥
---------------

1.  **Clone the Repository:**

    ```bash

    git clone https://github.com/lucasmaragu/nike-clone.git

2.  **Navigate to the Project Directory:**

    ```bash

    cd nike-clone

3.  **Install Dependencies:**

    ```bash

    npm install

Configuration ⚙️
----------------

1.  **Backend Setup:**

    -   Navigate to the `backend` directory:

        ```bash
        cd backend

    -   Install backend dependencies:

        ```bash
        npm install

    -   Create a `.env` file in the `backend` directory with the following environment variables:

        ```env

        DATABASE_URL=your_postgresql_database_url
        JWT_SECRET=your_jwt_secret_key
        SUPABASE_URL=your_supabase_url
        SUPABASE_KEY=your_supabase_key


      Replace `your_postgresql_database_url`, `your_jwt_secret_key`, `your_supabase_url`, and `your_supabase_key` with your actual credentials.

2.  **Database Migration:**

    -   Run the database migrations to set up the necessary tables:

        ```bash

        npx ts-node schema.ts

Running the Application ▶️
--------------------------

1.  **Start the Backend Server:**

    -   From the `backend/src/database` directory, run:

        ```bash

        npx ts-node server.ts

    The backend server will start and listen for requests.

2.  **Start the Frontend Server:**

    -   Navigate back to the root project directory if you're not already there:

        ```bash

        cd ..

    -   Start the Angular development server:

        ```bash

        ng serve

    -   Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you make any changes to the source files.

Usage 🖥️
---------

-   **Browse Products:** View a list of available products with images and details.

-   **User Authentication:** Register a new account or log in with existing credentials.

-   **Manage Cart:** Add products to your shopping cart and adjust quantities as needed.

-   **Complete Purchases:** Proceed to checkout and view your order history.

Contributing 🤝
---------------

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  **Fork the Repository.**

2.  **Create a New Branch:**

    ```bash

    git checkout -b feature/your-feature-name

3.  **Make Your Changes and Commit Them:**

    ```bash

    git commit -m 'Add some feature'

4.  **Push to the Branch:**

    ```bash

    git push origin feature/your-feature-name

5.  **Open a Pull Request.**

Please ensure your code follows the project's coding conventions and includes appropriate tests.

License 📄
----------

This project is licensed under the MIT License.
