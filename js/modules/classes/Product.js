import { formatPrice } from "../utils.js";
import { data } from "../data.js";

export default class Product {

    constructor(id, name, description, img, sizes) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.img = img;
        this.sizes = sizes;
    }

    currentPrice(formated = false) {

        let currentPrice = this.sizes[0].price;

        for (let size of this.sizes) {
            if (size.selected) {
                currentPrice = size.price;
            }
        }

        if (formated) {
            return formatPrice.toBrl(currentPrice);
        }
        return currentPrice;
    }

    findById(id) {
        const products = this.all();
        if (!products) {
            return null;
        }

        const data = products.filter(product => {
            return product.id == id;
        })[0] || null;

        return new Product(data.id, data.name, data.description, data.img, data.sizes);
    }

    all(limit = null) {
        const products = [];
        data.forEach(p => {
            products.push(new Product(p.id, p.name, p.description, p.img, p.sizes));
        });

        if (limit) {
            return products.slice(0, limit);
        }
        return products;
    }
}
