var escape = require('escape-html');
var fetch = require('node-fetch');

/*
    Generate HTML for the tab in the header

    @param {Block}
    @param {Boolean}
    @return {String}
*/
function createTab(block, i, isActive) {
    return '<div class="tab' + (isActive? ' active' : '') + '" data-codetab="' + i + '">' + block.kwargs.name + '</div>';
}

/*
    Generate HTML for the tab's content

    @param {Block}
    @param {Boolean}
    @return {String}
*/
function createTabBody(block, i, isActive) {
    return '<div class="tab' + (isActive? ' active' : '') + '" data-codetab="' + i + '"><pre><code class="lang-' + (block.kwargs.type || block.kwargs.name) + '">'
        + escape(block.body) +
    '</code></pre></div>';
}

module.exports = {
    book: {
        assets: './assets',
        css: [
            'codetabs.css'
        ],
        js: [
            'codetabs.js'
        ]
    },

    blocks: {
        codetabs: {
            blocks: ['language'],
            process: async function(parentBlock) {
                var blocks = [parentBlock].concat(parentBlock.blocks);

                let processBlock = async function(block, i) {
                    var isActive = (i == 0);

                    if (!block.kwargs.name) {
                        throw new Error('Code tab requires a "name" property');
                    }

                    if (block.kwargs.url) {
                        block.body = await fetch(block.kwargs.url).then((res) => res.text());
                    }

                    return {
                        tabHeader: createTab(block, i, isActive),
                        tabContent: createTabBody(block, i, isActive)
                    };
                };

                let buildOutput = function(formattedResults) {
                    let tabsHeader = '';
                    let tabsContent = '';
                    formattedResults.forEach(function(record) {
                        tabsHeader += record.tabHeader;
                        tabsContent+= record.tabContent;
                    });

                    return '<div class="codetabs">' +
                        '<div class="codetabs-header">' + tabsHeader + '</div>' +
                        '<div class="codetabs-body">' + tabsContent + '</div>' +
                        '</div>';
                };

                return await Promise.all(blocks.map(processBlock)).then(buildOutput);
            }
        }
    }
};
