module.exports = function Product(productlist){
    this.products = productlist=="undefined" ?{} : productlist;

    this.genrateArray = function() {
        var arr = [];
        for (var id in this.products){
            arr.push(this.products[id]);
        }
        return arr;
    }

};