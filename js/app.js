import { qs, qsAll, formatPrice } from "./modules/utils.js";
import Product from "./modules/classes/Product.js";

const DISCOUNT = 10;

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
    products: [],

    show() {
        this.update();
        this.cart.closest("aside").classList.add("show");
    },

    close() {
        this.cart.closest("aside").classList.remove("show");
    },

    update() {

        let subtotal = 0;
        for (let product of this.products) {
            subtotal += product.total;
        }

        const discount = (subtotal * DISCOUNT) / 100;
        const total = subtotal - discount;

        this.cart.querySelector("#subtotal-value").innerText = formatPrice.toBrl(subtotal);
        this.cart.querySelector("#discount-value").innerText = formatPrice.toBrl(discount);
        this.cart.querySelector("#total-value").innerText = formatPrice.toBrl(total);
        this.cart.querySelector("#discount").innerText = DISCOUNT;
    },

    add(product) {

        const key = `${product.id}@${product.currentSize}`;

        let currentProduct = null;

        for (let p in this.products) {

            if (this.products[p].id == product.id && this.products[p].currentSize == product.currentSize) {

                currentProduct = Object.assign((new Product), this.products[p]);
                currentProduct.total += product.total;
                currentProduct.totalQt += product.totalQt;
                currentProduct.currentSize = product.currentSize;
                currentProduct.key = key;

                this.products[p] = currentProduct;
                break;
            }
        }

        if (currentProduct) {
            qs(`.cart--item[data-key='${key}']`).querySelector(".cart--item--qt").innerText = currentProduct.totalQt;

        } else {
            const productItem = qs(".cart--item").cloneNode(true);
            productItem.dataset.id = product.id
            productItem.dataset.key = key;
            productItem.querySelector("img").src = product.img;
            productItem.querySelector(".cart--item-nome").innerText = `${product.name} (${product.getCurrentSize().name})`;
            productItem.querySelector(".cart--item--qt").innerText = product.totalQt;
            productItem.querySelector(".cart--item-qtmais").addEventListener("click", e => {
                productCart.addUnit(e.currentTarget.closest(".cart--item").dataset.key);
            });
            productItem.querySelector(".cart--item-qtmenos").addEventListener("click", e => {
                console.log("removendo", e.currentTarget.closest(".cart--item").dataset.key)
                productCart.removeUnit(e.currentTarget.closest(".cart--item").dataset.key);
            });

            qs(".cart--area .cart").appendChild(productItem);

            const save = Object.assign((new Product), product);
            save.key = key;
            this.products.push(save);
        }

        this.update();
    },

    addUnit(itemKey) {

        productCart.products.forEach((product, index) => {
            if (product.key == itemKey) {

                productCart.products[index].totalQt += 1;
                productCart.products[index].total += product.getCurrentSize().price;

                qs(`.cart--item[data-key='${itemKey}']`).querySelector(".cart--item--qt").innerText = productCart.products[index].totalQt;
                return;
            }
        });

        productCart.update();
    },

    removeUnit(itemKey) {

        productCart.products.forEach((product, index) => {

            if (product.key == itemKey) {

                product.totalQt -= 1;
                product.total -= product.getCurrentSize().price;

                if (product.totalQt < 1) {
                    productCart.products.splice(index, 1);
                    qs(`.cart--item[data-key='${itemKey}']`).remove();
                } else {
                    qs(`.cart--item[data-key='${itemKey}']`).querySelector(".cart--item--qt").innerText = product.totalQt;
                    productCart.products[index] = product;
                }
            }
        });
        productCart.update();
    },

    finalizeOrder() {

        const items = productCart.products.map(product => {
            const item = {};
            item.id = product.id;
            item.currentSize = product.currentSize;
            item.qt = product.totalQt;
            return item;
        });

        console.log("items do pedido:");
        items.forEach(i => {
            console.log(i);
        })
    }
}

const productModal = {

    modal: qs(".pizzaWindowArea"),
    active: false,
    product: null,
    currentSize: null,
    qt: 1,

    show(productId) {

        this.update(productId);

        this.modal.dataset.productId = productId;
        this.modal.style.display = "flex";
        setTimeout(_ => {
            this.modal.style.opacity = "1";
        }, 100);
    },

    update(productId) {

        const product = (new Product).findById(productId);
        if (!product) {
            return;
        }
        console.log(product);

        this.product = product;

        this.qt = 1;
        this.modal.querySelector(".pizzaInfo--qt").innerText = productModal.qt;

        this.modal.querySelector(".pizzaBig img").src = product.img;
        this.modal.querySelector(".pizzaInfo h1").innerText = product.name;
        this.modal.querySelector(".pizzaInfo--desc").innerText = product.description;
        this.modal.querySelector(".pizzaInfo--actualPrice").innerText = product.currentPrice(true);
        this.modal.querySelector(".pizzaInfo--sizes").innerHTML = null;

        product.sizes.forEach(size => {

            const sizeElement = document.createElement("div");
            sizeElement.dataset.id = size.id;

            sizeElement.addEventListener("click", e => {
                productModal.modal.querySelectorAll(".pizzaInfo--size").forEach(sizeElement => {
                    sizeElement.classList.remove("selected");
                });
                e.currentTarget.classList.add("selected");
                productModal.currentSize = e.currentTarget.dataset.id;
                productModal.modal.querySelector(".pizzaInfo--actualPrice").innerText = productModal.totalPrice(true);
            });

            sizeElement.classList.add("pizzaInfo--size");
            if (size.selected) {
                this.currentSize = size.id;
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

    addInCart() {

        const product = productModal.product;

        product.total = productModal.totalPrice();
        product.totalQt = productModal.qt;
        product.currentSize = parseInt(productModal.currentSize);

        productCart.add(product);
    },

    addUnit() {
        productModal.qt += 1;
        productModal.modal.querySelector(".pizzaInfo--actualPrice").innerText = productModal.totalPrice(true);
        productModal.modal.querySelector(".pizzaInfo--qt").innerText = productModal.qt;
    },

    removeUnit() {

        productModal.qt -= 1;
        if (productModal.qt < 1) {
            productModal.qt = 1;
        }
        productModal.modal.querySelector(".pizzaInfo--actualPrice").innerText = productModal.totalPrice(true);
        productModal.modal.querySelector(".pizzaInfo--qt").innerText = productModal.qt;
    },

    totalPrice(formated = false) {

        const totalPrice = productModal.product.getPriceBySize(productModal.currentSize) * productModal.qt;

        if (formated) {
            return formatPrice.toBrl(totalPrice);
        }
        return totalPrice;
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
productModal.modal.querySelector(".pizzaInfo--qtmais").addEventListener("click", productModal.addUnit);
productModal.modal.querySelector(".pizzaInfo--qtmenos").addEventListener("click", productModal.removeUnit);
productModal.modal.querySelector(".pizzaInfo--addButton").addEventListener("click", productModal.addInCart);
productModal.modal.querySelector(".pizzaWindowBody").addEventListener("click", _ => {
    productModal.active = true;
    setTimeout(_ => {
        productModal.active = false;
    }, 500);
});


productCart.cart.querySelector(".cart--finalizar").addEventListener("click", productCart.finalizeOrder);


// init
addProducts();
setTimeout(_ => {
    productCart.show();
}, 400);
