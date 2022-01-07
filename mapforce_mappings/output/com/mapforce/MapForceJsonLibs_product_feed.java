package  com.mapforce;
import com.altova.json.*;
import com.altova.json.PropertyRule.NameMatchKind;
import com.altova.json.PropertyGroup.PropertyGroupBehavior;

public class MapForceJsonLibs_product_feed
{
    public static ValueAcceptor[] Schemas = 
    {
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_02/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_02//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_02//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.ContinueWithNext, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_02//items/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{               new AlsoAcceptor(1, null, new Reference[]{ new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_02/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_04/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06/@64"), 
                             }),
}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_02//items/!additionalProperties/@127", 
                new StringAcceptor(null, null, null, null), 
                new NumberAcceptor(null, null, null, null, null),
                new BooleanAcceptor(true, true),
                new NullAcceptor(),
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("about:universal#//$ref/@127"), }),
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.ContinueWithNext, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("about:universal#//$ref/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{               new AlsoAcceptor(1, null, new Reference[]{ new Reference("about:universal#//$ref/@127"), 
                             }),
}
            ),
            new ValueAcceptor(
                "about:universal#//$ref/@127", 
                new StringAcceptor(null, null, null, null), 
                new NumberAcceptor(null, null, null, null, null),
                new BooleanAcceptor(true, true),
                new NullAcceptor(),
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("about:universal#//$ref/@127"), }),
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("about:universal#//$ref/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "about:universal#//$ref/!additionalProperties/@127", 
                new StringAcceptor(null, null, null, null), 
                new NumberAcceptor(null, null, null, null, null),
                new BooleanAcceptor(true, true),
                new NullAcceptor(),
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("about:universal#//$ref/@127"), }),
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.ContinueWithNext, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("about:universal#//$ref/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{               new AlsoAcceptor(1, null, new Reference[]{ new Reference("about:universal#//$ref/@127"), 
                             }),
}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_02/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("header", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_01/@64"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_01/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("version", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_01//properties//version/@16"), null, new Reference("##fail")),
                       new PropertyRule("scope", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_01/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_01//properties//version/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_01/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_01//items/@16"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_01//items/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_04/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("attributes", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_04//properties//attributes/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_04//properties//attributes/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:data_type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:data_type/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:entity_types", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//array_01/@32"), null, new Reference("##fail")),
                       new PropertyRule("salsify:is_facetable", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:is_facetable/@2"), null, new Reference("##fail")),
                       new PropertyRule("salsify:attribute_group", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:attribute_group/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:position", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:position/@1"), null, new Reference("##fail")),
                       new PropertyRule("salsify:help_text", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:help_text/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:manage_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:manage_permissions/@1"), null, new Reference("##fail")),
                       new PropertyRule("salsify:read_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:read_permissions/@1"), null, new Reference("##fail")),
                       new PropertyRule("salsify:hidden_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:hidden_permissions/@1"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:type/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:system_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:system_id/@16"), null, new Reference("##fail")),
                       new PropertyRule("MapToAttribute", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//MapToAttribute/@16"), null, new Reference("##fail")),
                       new PropertyRule("MapToWCE", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//MapToWCE/@16"), null, new Reference("##fail")),
                       new PropertyRule("ImportLevel", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//ImportLevel/@16"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:data_type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:is_facetable/@2", 
                null, 
                null,
                new BooleanAcceptor(true, true),
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:attribute_group/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:position/@1", 
                null, 
                null,
                null,
                new NullAcceptor(),
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:help_text/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:manage_permissions/@1", 
                null, 
                null,
                null,
                new NullAcceptor(),
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:read_permissions/@1", 
                null, 
                null,
                null,
                new NullAcceptor(),
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:hidden_permissions/@1", 
                null, 
                null,
                null,
                new NullAcceptor(),
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//salsify:system_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//MapToAttribute/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//MapToWCE/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_03//properties//ImportLevel/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("attribute_values", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:attribute_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:attribute_id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:attribute_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_05//properties//attribute_values//items//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("digital_assets", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:url", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:url/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:source_url", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:source_url/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:status", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:status/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_height", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_height/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_width", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_width/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_resource_type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_resource_type/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:filename", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:filename/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:bytes", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:bytes/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:format", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:format/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:etag", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:etag/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:system_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:system_id/@16"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:url/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:source_url/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:status/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_height/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_width/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:asset_resource_type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:filename/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:bytes/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:format/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:etag/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/product-feed.schema.json#//definitions//object_06//properties//digital_assets//items//properties//salsify:system_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),

    };
}    
