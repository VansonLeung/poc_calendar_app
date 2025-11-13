

export const initializeMigrations = async ({
    models,
}) => {
            /*
        

        const role1 = await UserRole.create({
            code: 'admin',
        });
        const role2 = await UserRole.create({
            code: 'user',
        });


        const u1 = await User.create({
            email: 'abc@abc.com',
            username: 'admin',
            userRoleId: role1.id,
        });
        const u2 = await User.create({
            email: 'sss',
            username: 'user',
            userRoleId: role2.id,
        });


        const pmsn1 = await UserPermission.create({
            code: 'admin - manage users',
        });
        const pmsn2 = await UserPermission.create({
            code: 'user - manage profile',
        });
        const pmsn3 = await UserPermission.create({
            code: 'user - manage cart',
        });
        const pmsn4 = await UserPermission.create({
            code: 'user - manage order',
        });


        const role_pmsn_1 = await UserRolePermissionMapping.create({
            userRoleId: role1.id,
            userPermissionId: pmsn1.id,
        });
        const role_pmsn_2 = await UserRolePermissionMapping.create({
            userRoleId: role2.id,
            userPermissionId: pmsn2.id,
        });
        const role_pmsn_3 = await UserRolePermissionMapping.create({
            userRoleId: role2.id,
            userPermissionId: pmsn3.id,
        });
        const role_pmsn_4 = await UserRolePermissionMapping.create({
            userRoleId: role2.id,
            userPermissionId: pmsn4.id,
        });



        const shop1 = await Shop.create({
            name: 'shop1',
        });

        const shopOwner1 = await ShopOwnerMapping.create({
            shopId: shop1.id,
            userId: u1.id,
        });




        

        try {
            // const userRole = await UserRole.findByPk(role2.id, {
            //     include: [{
            //         model: UserPermission,
            //         as: 'userPermissions',
            //     }],
            // });
    
            const userRole = await UserRole.findByPk(role2.id);
            const userPermissions = await userRole.getUserPermissions();

            if (!userRole) {
                console.log('User role not found');
                return [];
            }
    
            // const permissions = userRole.userPermissions.map(permission => permission.toJSON());
            const permissions = userPermissions.map(permission => permission.toJSON());
            console.log(permissions)
        } catch (error) {
            console.error('Error querying permissions by user role ID:', error);
        }



        try {

        
            const results = await sequelize.transaction(async t => {

                const product1 = await Product.create({
                    name: 'product1',
                    variants_json: {"colors": {"red": 1, "blue": 1, "green": 1, }, },
                });
    
                const shopProduct1 = await ShopProductMapping.create({
                    shopId: shop1.id,
                    productId: product1.id,
                });

                const qProductResultsByColors = await Product.findAndCountAll({
                    where: {
                        [Op.or]: [
                            {'variants_json.colors.red': 1,},
                            {'variants_json.colors.blue': 1,},
                        ],
                    },
                    include: [
                        {
                            model: Shop,
                            as: 'shops',
                        },
                    ]
                });

                return [product1, shopProduct1, qProductResultsByColors, qProductResultsByColors.rows]
            });
    
            console.log(results);

        } catch (e) {
            console.error(e);
        }



        try {

        
            const results = await sequelize.transaction(async t => {

                const pt1 = await ProductType.create({
                    name: 'pt1',
                });
    
                const shopPt1 = await ShopProductTypeMapping.create({
                    shopId: shop1.id,
                    productTypeId: pt1.id,
                });

                const qResults = await ProductType.findAndCountAll({
                    where: {
                        name: 'pt1',
                    },
                    include: [
                        {
                            model: Shop,
                            as: 'shops',
                        },
                    ]
                });

                return [pt1, shopPt1, qResults, qResults.rows]
            });
    
            console.log(results);

        } catch (e) {
            console.error(e);
        }





        try {

        
            const results = await sequelize.transaction(async t => {

                const pt1 = await ProductType.findOne({
                    name: 'pt1',
                });
    
                const p1 = await Product.findAll({
                    shopId: shop1.id,
                });

                for (var itm of p1) {
                    console.log("AAAXXX", itm.setProductTypes)
                    await itm.setProductTypes([pt1.id]);
                    await itm.addProductTypes([pt1.id]);
                    await itm.removeProductTypes([pt1.id]);
                    await itm.addProductTypes([pt1.id]);
                    console.log("XXX", itm.setProductTypes, itm.addProductTypes, itm.removeProductTypes)
                }

                return [pt1, p1]
            });
    
            console.log("SSS", results);

        } catch (e) {
            console.error(e);
        }




        const lang_zh_HK = await Lang.create({
            code: "zh_HK",
        })

        



        try {

            const results = await sequelize.transaction(async t => {

                const pt1 = await ProductType.findOne({
                    where: {
                        name: 'pt1',
                    }
                });

                await pt1.addChild(await ProductType.create({
                    name: 'pt1_a',
                }))

                return pt1;
            });
    
            console.log("SSSXXX", results);

        } catch (e) {
            console.error(e);
        }


        try {

            const results = await sequelize.transaction(async t => {

                const pt1_a = await ProductType.findOne({
                    where: {
                        parentId: {[Op.ne]: null},
                    },
                    include: [{ association: 'parent' }],
                })

                console.log([pt1_a, "AA", JSON.stringify(pt1_a.parent), "XX", JSON.stringify(await pt1_a.getParent()), ]);
                console.log(await ProductType.findByPk(pt1_a.parentId));

            });

        } catch (e) {
            console.error(e);
        }



        try {

            const results = await sequelize.transaction(async t => {

                const pt1_a = await ProductType.findOne({
                    where: {
                        name: "pt1_a",
                    },
                })

                await pt1_a.addDerivatives([
                    await ProductType.create({
                        name: "pt1_a_zh_HK",
                        desc: "pt1_a_zh_HK desc here",
                        langId: lang_zh_HK.id,
                    })
                ])

                const pts_display_and_base_results = await ProductType.findAndCountAll({
                    where: {
                        baseId: {[Op.ne]: null},
                    },
                    include: [{ association: 'base' }],
                })

                return [pts_display_and_base_results]
            });

            console.log(JSON.stringify(results));

        } catch (e) {
            console.error(e);
        }


        */

}
