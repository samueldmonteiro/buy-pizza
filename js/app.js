import { qs, qsAll, formatPrice } from "./modules/utils.js";
import Product from "./modules/classes/Product.js";

const addProducts = _ => {

    const products = (new Product).all();
    if (!products.length) {
        return;
    }

    products.forEach(product => {

        const productItem = qs(".models .pizza-item").cloneNode(true);
        productItem.dataset.productId = product.id;
        productItem.querySelector(".pizza-item--img img").src = product.img;
        productItem.querySelector(".pizza-item--name").innerText = product.name;
        productItem.querySelector(".pizza-item--desc").innerText = product.description;
        productItem.querySelector(".pizza-item--price").innerText = product.currentPrice(true);

        productItem.querySelector("a").addEventListener("click", e => {
            e.preventDefault();
            const pId = e.currentTarget.closest(".pizza-item").dataset.productId;
            productModal.show(pId);
        });

        qs(".pizza-area").appendChild(productItem);
    });
}

const productCart = {

    cart: qs(".cart--area"),

    show() {
        this.cart.closest("aside").classList.add("show");
    },

    close() {
        this.cart.closest("aside").classList.remove("show");
    }
}

const productModal = {

    modal: qs(".pizzaWindowArea"),
    active: false,

    show(productId) {

        this.insertData(productId);

        this.modal.dataset.productId = productId;
        this.modal.style.display = "flex";
        setTimeout(_ => {
            this.modal.style.opacity = "1";
        }, 100);
    },

    insertData(productId) {

        const product = (new Product).findById(productId);
        if (!product) {
            return;
        }

        console.log(product);

        this.modal.querySelector(".pizzaBig img").src = product.img;
        this.modal.querySelector(".pizzaInfo h1").innerText = product.name;
        this.modal.querySelector(".pizzaInfo--desc").innerText = product.description;
        this.modal.querySelector(".pizzaInfo--actualPrice").innerText = product.currentPrice(true);
        this.modal.querySelector(".pizzaInfo--sizes").innerHTML = null;

        product.sizes.forEach(size => {

            const sizeElement = document.createElement("div");
            sizeElement.classList.add("pizzaInfo--size");
            if (size.selected) {
                sizeElement.classList.add("selected")
            }
            sizeElement.dataset.price = size.price;
            sizeElement.append(size.name.toUpperCase());

            const priceElement = document.createElement("span");
            priceElement.innerText = formatPrice.toBrl(size.price);
            sizeElement.appendChild(priceElement);

            this.modal.querySelector(".pizzaInfo--sizes").appendChild(sizeElement);
        });
    },

    close() {
        if (!productModal.active) {
            productModal.modal.style.opacity = "0";
            setTimeout(_ => {
                productModal.modal.style.display = "none";
            }, 150);
        }
    }
}

productModal.modal.addEventListener("click", productModal.close);
productModal.modal.querySelector(".pizzaInfo--cancelButton").addEventListener("click", productModal.close);

productModal.modal.querySelector(".pizzaWindowBody").addEventListener("click", _ => {
    productModal.active = true;
    setTimeout(_ => {
        productModal.active = false;
    }, 500);
});


addProducts();
setTimeout(_ => {
    productCart.show();
}, 400);