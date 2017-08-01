describe('router', function () {

    beforeEach(function() {
        rb.Router.flush();
        rb.Router.unlisten();
    });

    it('applies routes', function(){
        rb.Router.config();

        const userEdit = jasmine.createSpy('userEdit');
        const userEditItem = jasmine.createSpy('userEditItem');
        const userId = jasmine.createSpy('userId');
        const userList = jasmine.createSpy('userList');
        const userListWildCard = jasmine.createSpy('userListWildCard');
        const user = jasmine.createSpy('user');
        const customer = jasmine.createSpy('customer');
        const home = jasmine.createSpy('home');
        const matchAll = jasmine.createSpy('matchAll');

        rb.Router
            .map({
                '/user/:id/editItem/:itemdId': userEditItem,
                '/user/:id/edit': userEdit,
                '/user/list/': userList,
                '/user/list*': userListWildCard,
                '/user/:id/': userId,
                '/user/': user,
                '/customer': customer,
                '/': home,
                '*': matchAll,
            })
        ;

        rb.Router.applyRoutes('user');

        expect(user).toHaveBeenCalledWith({}, {}, {fragment: 'user', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        expect(userId.calls.count()).toEqual(0);
        expect(customer.calls.count()).toEqual(0);

        rb.Router.applyRoutes('user/theId');

        expect(userId).toHaveBeenCalledWith({id: 'theId'}, {}, {fragment: 'user/theId', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        expect(userList.calls.count()).toEqual(0);
        expect(userList.calls.count()).toEqual(0);
        expect(user.calls.count()).toEqual(1);

        expect(matchAll.calls.count()).toEqual(0);

        rb.Router.applyRoutes('en/customer/');
        expect(matchAll.calls.count()).toEqual(1);

        expect(customer.calls.count()).toEqual(0);

        rb.Router.applyRoutes('customer/');

        expect(customer.calls.count()).toEqual(1);

        rb.Router.applyRoutes('user/theUserId-1/editItem/theItemId-1');

        expect(userEditItem).toHaveBeenCalledWith({id: 'theUserId-1', itemdId: 'theItemId-1'}, {}, {fragment: 'user/theUserId-1/editItem/theItemId-1', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        expect(userList.calls.count()).toEqual(0);


        rb.Router.applyRoutes('user/list/foo/bar');

        expect(userList.calls.count()).toEqual(0);
        expect(userListWildCard.calls.count()).toEqual(1);

        expect(home.calls.count()).toEqual(0);
        rb.Router.applyRoutes('');

        expect(home.calls.count()).toEqual(1);

        rb.Router.applyRoutes('/');
        expect(home.calls.count()).toEqual(2);

        rb.Router.applyRoutes('/index.html');
        expect(home.calls.count()).toEqual(3);

        expect(matchAll.calls.count()).toEqual(1);
        rb.Router.applyRoutes('randomShit/yofsad');

        expect(matchAll.calls.count()).toEqual(2);
    });

    it('handles nested routes', function(){
        rb.Router.config();

        const availableLangs = {en: true, de: true};

        const routes = {
            '/:lang': {
                handler({lang}, _options, _data){
                    const isAvailable = (lang in availableLangs);

                    return isAvailable;
                },
                subRoutes: {
                    '/': jasmine.createSpy('langHome'),
                    '/products': jasmine.createSpy('products'),
                    'products/:id': jasmine.createSpy('products'),
                    'products/:id/edit/': jasmine.createSpy('products'),
                },
                //'*': jasmine.createSpy('matchAllLang')
            },
            '*': jasmine.createSpy('matchAll'),
        };

        spyOn(routes['/:lang'], 'handler').and.callThrough();

        rb.Router.map(routes);

        rb.Router.applyRoutes('/en/');

        expect(routes['/:lang'].handler).toHaveBeenCalledWith({lang: 'en'}, {}, {fragment: 'en', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});
        expect(routes['/:lang'].subRoutes['/'].handler).toHaveBeenCalledWith({lang: 'en'}, {}, {fragment: 'en', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        rb.Router.applyRoutes('/en/products/12/edit/');

        expect(routes['/:lang'].handler.calls.count()).toEqual(2);
        expect(routes['/:lang'].subRoutes['/products'].handler.calls.count()).toEqual(0);
        expect(routes['/:lang'].subRoutes['products/:id/edit/'].handler.calls.count()).toEqual(1);
        expect(routes['/:lang'].subRoutes['products/:id/edit/'].handler).toHaveBeenCalledWith({lang: 'en', id: '12'}, {}, {fragment: 'en/products/12/edit', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});
        expect(routes['/:lang'].handler).toHaveBeenCalledWith({lang: 'en', '*': 'products/12/edit'}, {}, {fragment: 'en/products/12/edit', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        rb.Router.applyRoutes('/en/products/12/edit/?foo=bar');

        expect(routes['/:lang'].subRoutes['products/:id/edit/'].handler.calls.count()).toEqual(2);
        expect(routes['/:lang'].subRoutes['products/:id/edit/'].handler).toHaveBeenCalledWith({lang: 'en', id: '12'}, {foo: 'bar'}, {fragment: 'en/products/12/edit', changedRoute: false, changedOptions: true, caller: { type: 'unknown/initial'}});

        rb.Router.applyRoutes('/de/products');
        expect(routes['/:lang'].subRoutes['/products'].handler.calls.count()).toEqual(1);

        expect(routes['*'].handler.calls.count()).toEqual(0);

        rb.Router.applyRoutes('/unknownLanguage/products');

        expect(routes['/:lang'].subRoutes['/products'].handler.calls.count()).toEqual(1);
        expect(routes['*'].handler.calls.count()).toEqual(1);

        expect(routes['/:lang'].handler).toHaveBeenCalledWith({lang: 'unknownLanguage', '*': 'products'}, {}, {fragment: 'unknownLanguage/products', changedRoute: true, changedOptions: false, caller: { type: 'unknown/initial'}});

        rb.Router.applyRoutes('/de/products/foo/bar');
        expect(routes['*'].handler.calls.count()).toEqual(2);
        expect(routes['/:lang'].subRoutes['/products'].handler.calls.count()).toEqual(1);
        expect(routes['/:lang'].subRoutes['products/:id/edit/'].handler.calls.count()).toEqual(2);

    });
});
