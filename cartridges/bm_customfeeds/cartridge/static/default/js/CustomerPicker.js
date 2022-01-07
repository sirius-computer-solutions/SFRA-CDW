Ext.define('Customer', {
    extend: 'Ext.data.Model',
    fields: ['customerNo', 'firstName', 'lastName']
});

Ext.create('dw.ext.SystemObjectStore',{
	storeId: 'CustomerStore',
	type: 'Profile', 
	model:'Customer',
	pageSize: 15,
	remotefilter: true
});

Ext.define('dw.ext.CustomerPicker', {
    extend: 'Ext.window.Window',
	title: 'Customer picker',
	height: 400,
	width: 640,
	layout: 'fit',
	items : {
	    xtype: 'grid',
	    border: false,
	    dockedItems: [{
	        xtype: 'pagingtoolbar',
	        store: 'CustomerStore',
	        dock: 'bottom',
	        displayInfo: true
	    }],
	    columns: [{header :'CustomerNo', dataIndex: 'customerNo', flex: 1},{header :'First Name', dataIndex: 'firstName', flex: 1},{header :'Last Name', dataIndex: 'lastName', flex: 1}],
	    store: 'CustomerStore'
	}
});