// alias for querySelector / all

export const qs = element => {
    return document.querySelector(element);
}

export const qsAll = element => {
    return document.querySelectorAll(element);
}

export const formatPrice = {

    toBrl(price) {
        return price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
}