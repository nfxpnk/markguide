'use strict';

function createDummyArray(num) {
    const dummyArray = [];

    for (let i = 0; i < num; i++) {
        dummyArray.push('spacer');
    }

    return dummyArray;
}

function hasDirectPage(category) {
    return category.subPages.some(node => node.type !== 'category');
}

function getCategoryChildren(category) {
    return category.subPages.filter(node => node.type === 'category');
}

function removeEmptyCategories(collection) {
    for (let i = collection.length - 1; i >= 0; i--) {
        if (collection[i].type === 'category') {
            removeEmptyCategories(collection[i].subPages);

            if (collection[i].subPages.length === 0) {
                collection.splice(i, 1);
            }
        }
    }
}

function compactCategory(category) {
    category.subPages.forEach(node => {
        if (node.type === 'category') {
            compactCategory(node);
        }
    });

    let categoryChildren = getCategoryChildren(category);

    while (!hasDirectPage(category) && categoryChildren.length === 1 && category.subPages.length === 1) {
        const child = categoryChildren[0];

        category.title += '/' + child.title;
        category.subPages = child.subPages;

        category.subPages.forEach(node => {
            if (node.type === 'category') {
                compactCategory(node);
            }
        });

        categoryChildren = getCategoryChildren(category);
    }
}

function resetDepth(collection, depth) {
    collection.forEach(node => {
        node.depth = createDummyArray(depth);

        if (node.subPages.length) {
            resetDepth(node.subPages, depth + 1);
        }
    });
}

function normalizeNavigationTree(collection, mode) {
    if (mode === 'compact') {
        removeEmptyCategories(collection);

        collection.forEach(node => {
            if (node.type === 'category') {
                compactCategory(node);
            }
        });

        resetDepth(collection, 0);
    }

    return collection;
}

module.exports = {
    createDummyArray,
    normalizeNavigationTree,
    removeEmptyCategories
};