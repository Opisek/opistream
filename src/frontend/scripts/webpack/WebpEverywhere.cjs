module.exports = function(source) {
    return [...source.matchAll(/(?:'|")((?:\.{0,2}\/)[^'"]+\.(?:png|jpe?g|webp|gif|svg|))(?!(?:\?|&)as=)(\?[^'"]*)?(?:'|")/g)]
        .reduce(
            (modifiedSource, match) => modifiedSource.replaceAll(
                match[0],
                `"${match[1]}${match[2] == undefined ? "?" : match[2] + "&"}as=webp"`
            ), 
            source
        );
};