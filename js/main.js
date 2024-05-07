const viewsDiv = document.querySelectorAll('.view');
const shopDiv = document.getElementById('shop');
const productsDiv = document.getElementById('products');
const welcomeDiv = document.getElementById('welcome');
const signupDiv = document.getElementById('signup');
const signinDiv = document.getElementById('signin');
const chartDiv = document.getElementById('chart');
const productsChartDiv = document.getElementById('products-chart');
const adminControllerDiv = document.getElementById('admin-controller');
const navLink = document.querySelectorAll('.nav-link');
const welcomeBtn = document.getElementById('welcome-btn');
const shopBtn = document.getElementById('shop-btn');
const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const chartBtn = document.getElementById('chart-btn');
const adminControllerBtn = document.getElementById('admin-controller-btn');
const searchBtn = document.getElementById('search-btn');
const descendingBtn = document.getElementById('descending-btn');
const ascendingBtn = document.getElementById('ascending-btn');
const formSearch = document.getElementById('form-search');
const searchInput = document.getElementById('search-input');

const nameSignUp = document.getElementById('signup-username');
const emailSignUp = document.getElementById('signup-email');
const passwordSignUp = document.getElementById('signup-password');
const birthdateSignUp = document.getElementById('signup-birthdate');
const phoneSignUp = document.getElementById('signup-phone');
const addressSignUp = document.getElementById('signup-address');
const signUpFormBtn = document.getElementById('signup-form-btn');

const emailSignIn = document.getElementById('signin-email');
const passwordSignIn = document.getElementById('signin-password');
const signInFormBtn = document.getElementById('signin-form-btn');

const alertSignUp = document.getElementById('alert-signup');
const alertSignIn = document.getElementById('alert-signin');

const PORT = 3001;
const URLSERVER = `http://localhost:${PORT}`;

let products = [];

const deleteAlert = (what, how) => {
	setTimeout(() => {
		what.innerHTML = how;
	}, 3000);
};

const appendAlert = (message, type, liveAlertPlaceholder) => {
	liveAlertPlaceholder.innerHTML = `<div id='appendedWraper' class="alert alert-${type} alert-dismissible" role="alert">
                            <div>${message}</div>
                        </div>`;
};

const hideViews = () => {
	viewsDiv.forEach((view) => {
		view.classList.add('d-none');
	});
	navLink.forEach((link) => {
		link.classList.remove('active');
	});
};

const showView = (view, btn) => {
	hideViews();
	view.classList.remove('d-none');
	btn.classList.add('active');
};

const obtainProducts = async () => {
	try {
		const res = await axios.get(URLSERVER + '/products');
		products = res.data.products;
	} catch (error) {
		console.error(error);
	}
};
obtainProducts();

const deleteProduct = async (id) => {
	try {
		const token = localStorage.getItem("authorization");
		console.log('token',token);
		await axios.delete(URLSERVER + `/products/id/${id}`,{headers: {authorization: token,}},);
		products = [];
		await obtainProducts();
		printProducts(products,productsDiv)
	} catch (error) {
		console.error(error);
	}
};

const deleteProductsBtns = () => {
	const productsCard = document.querySelectorAll('.product');
	console.log('productCard',productsCard);
	productsCard.forEach(productCard => {
		const deleteBtn = document.createElement('button');
		deleteBtn.setAttribute('class','btn btn-danger');
		deleteBtn.setAttribute('onclick',`deleteProduct('${productCard.id}')`);
		deleteBtn.innerText = 'Delete Product';
		productCard.prepend(deleteBtn);
	})
};

const printProducts = (products, where) => {
	console.log('printproducts', products);
	where.innerHTML = '';
	products.forEach(async (product) => {
		const categories = product.Categories;
		if (categories.length > 1) {
			where.innerHTML += `<div id="${product.id}" class="card product" style="width: 18rem;">
        <img src="${URLSERVER}${product.img}" class="card-img-top" alt="...">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
          <p class="card-text">${product.price}€</p>
          <a href="#" class="btn btn-secondary my-1">${product.Categories[0].category}</a>
          <a href="#" class="btn btn-secondary my-1">${product.Categories[1].category}</a>
          <a id="product-btn${product.id}" href="#" class="btn btn-primary my-1" onclick="toChart('${product.id}')">Add to Chart</a>
          </div>
      </div>`;
		} else {
			where.innerHTML += `<div id="${product.id}" class="card product" style="width: 18rem;">
            <img src="${URLSERVER}${product.img}" class="card-img-top" alt="...">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <p class="card-text">${product.price}</p>
              <a href="#" class="btn btn-secondary my-1">${product.Categories[0].category}</a>
              <a id="product-btn${product.id}" href="#" class="btn btn-primary my-1" onclick="toChart('${product.id}')">Add to Chart</a>
            </div>
          </div>`;
		}
	});
	if (localStorage.logedUser){
		const logedUser =  JSON.parse(localStorage.getItem("logedUser"));
		if (logedUser.role = 'admin') {
			deleteProductsBtns();
		}
	}
};

const searchProductByName = async (search) => {
	try {
		const res = await axios.get(URLSERVER + `/products/name/${search}`);
		const result = res.data.products;
		hideViews();
		shopDiv.classList.remove('d-none');
		if (result.length > 0) {
			printProducts(result, productsDiv);
		} else {
			const h2 = document.createElement('h2');
			h2.innerText = 'Your Product was not found.';
		productsDiv.appendChild(h2);
		}
	} catch (error) {
		console.error(error);

	}
};

const toChart = (id) => {
	if (!localStorage.getItem('chart')) {
		localStorage.setItem(`chart${logedUser.id}`, JSON.stringify([id]));
	} else {
		const chart = JSON.parse(localStorage.getItem('chart'));
		chart.push(id);
		localStorage.setItem('chart', JSON.stringify(chart));
		console.log('chart', chart);
	}
};

const showChart = () => {
	hideViews();
	chartDiv.classList.remove('d-none');
	const chart = JSON.parse(localStorage.getItem('chart'));
	let productsChart = [];
	console.log('prouctscahrt', productsChart);
	chart.forEach(async (product) => {
		const res = await axios.get(URLSERVER + '/products/id/' + product);
		const productChart = res.data.product;
		productsChart.push(productChart);
	});
	printProducts(productsChart, productsChartDiv);
};

const filteredProductsByPrice = async (order) => {
	productsDiv.innerHTML = '';
	try {
		const res = await axios.get(URLSERVER + '/products/' + order);
		const products = res.data.products;
		printProducts(products, productsDiv);
	} catch (error) {
		console.error(error);
	}
};

const signup = async () => {
	try {
		const user = {};
		user.name = nameSignUp.value;
		user.email = emailSignUp.value;
		user.password = passwordSignUp.value;
		user.birthdate = birthdateSignUp.value;
		user.phone = phoneSignUp.value;
		user.address = addressSignUp.value;
		await axios.post(URLSERVER + '/users/signup', user);
	} catch (error) {
		console.error(error);
		appendAlert(`${error.response.data.msg}`, 'danger', alertSignUp);
		deleteAlert(alertSignUp, '');
	}
};

const signin = async () => {
	try {
		const user = {};
		user.email = emailSignIn.value;
		user.password = passwordSignIn.value;
		user.device = navigator.userAgent;
		const res = await axios.post(URLSERVER + '/users/signin', user);
		console.log(res);
		const logedUser = res.data.user;
		localStorage.setItem('logedUser', JSON.stringify(logedUser));
		localStorage.setItem('authorization',res.data.token);
		hideViews();
		shopDiv.classList.remove('d-none');
		printProducts(products, productsDiv);
	} catch (error) {
		console.error(error);
		appendAlert(`${error.response.data.msg}`, 'danger', alertSignIn);
		deleteAlert(alertSignIn, '');
	}
};

signInFormBtn.addEventListener('click', () => {
	signin();
});

signUpFormBtn.addEventListener('click', () => {
	signup();
});

searchBtn.addEventListener('click', () => {
	const search = searchInput.value;
	console.log('search', search);
	searchProductByName(search);
});

descendingBtn.addEventListener('click', () => {
	filteredProductsByPrice('/descprice');
});

ascendingBtn.addEventListener('click', () => {
	filteredProductsByPrice('/ascprice');
});
