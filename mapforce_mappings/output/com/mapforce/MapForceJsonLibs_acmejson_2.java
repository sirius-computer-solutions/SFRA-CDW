package  com.mapforce;
import com.altova.json.*;
import com.altova.json.PropertyRule.NameMatchKind;
import com.altova.json.PropertyGroup.PropertyGroupBehavior;

public class MapForceJsonLibs_cdwjson_2
{
    public static ValueAcceptor[] Schemas = 
    {
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//main_array/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//main_array//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//main_array//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.ContinueWithNext, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//main_array//items/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{               new AlsoAcceptor(1, null, new Reference[]{ new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header_obj/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes_obj/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj/@64"), 
                            new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products_obj/@64"), 
                             }),
}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//main_array//items/!additionalProperties/@127", 
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
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header_obj/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("header", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header/@64"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("version", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header//properties//version/@16"), null, new Reference("##fail")),
                       new PropertyRule("scope", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//array_string/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//header//properties//version/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//array_string/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//array_string//items/@16"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//array_string//items/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes_obj/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("attributes", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes_obj//properties//attributes/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes_obj//properties//attributes/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:data_type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:data_type/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:entity_types", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//array_string/@32"), null, new Reference("##fail")),
                       new PropertyRule("salsify:is_facetable", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:is_facetable/@2"), null, new Reference("##fail")),
                       new PropertyRule("salsify:attribute_group", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:attribute_group/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:type/@16"), null, null),
                       new PropertyRule("salsify:system_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:system_id/@16"), null, null),
                       new PropertyRule("MapToAttribute", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//MapToAttribute/@16"), null, null),
                       new PropertyRule("MapToWCE", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//MapToWCE/@16"), null, null),
                       new PropertyRule("ImportLevel", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//ImportLevel/@16"), null, null),
                       new PropertyRule("salsify:manage_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/!additionalProperties/@127"), null, new Reference("##fail")),
                       new PropertyRule("salsify:hidden_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/!additionalProperties/@127"), null, new Reference("##fail")),
                       new PropertyRule("salsify:read_permissions", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/!additionalProperties/@127"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:data_type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:is_facetable/@2", 
                null, 
                null,
                new BooleanAcceptor(true, true),
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:attribute_group/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//salsify:system_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//MapToAttribute/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//MapToWCE/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes//properties//ImportLevel/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributes/!additionalProperties/@127", 
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
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("attribute_values", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:attribute_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:attribute_id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:attribute_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//attributevalue_obj//properties//attribute_values//items/!additionalProperties/@127", 
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
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("digital_assets", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:id/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:url", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:url/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:source_url", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:source_url/@16"), null, null),
                       new PropertyRule("salsify:name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:name/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:created_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:updated_at/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:status", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:status/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_height", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_height/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_width", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_width/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:asset_resource_type", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_resource_type/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:filename", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:filename/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:bytes", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:bytes/@4"), null, new Reference("##fail")),
                       new PropertyRule("salsify:format", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:format/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:etag", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:etag/@16"), null, new Reference("##fail")),
                       new PropertyRule("salsify:system_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:system_id/@16"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:url/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:source_url/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:status/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_height/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_width/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:asset_resource_type/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:filename/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:bytes/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:format/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:etag/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items//properties//salsify:system_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//digitalassets_obj//properties//digital_assets//items/!additionalProperties/@127", 
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
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products_obj/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("products", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products_obj//properties//products/@32"), null, new Reference("##fail")),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("##fail"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products_obj//properties//products/@32", 
                null, 
                null,
                null,
                null,
                new ArrayAcceptor(null, null, false, new Reference[]{new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products/@64"), }),
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products/@64", 
                null, 
                null,
                null,
                null,
                null,
                new ObjectAcceptor(null, null, new PropertyGroup[]{
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("salsify:id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:id/@16"), null, null),
                       new PropertyRule("salsify:created_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:created_at/@16"), null, null),
                       new PropertyRule("salsify:updated_at", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:updated_at/@16"), null, null),
                       new PropertyRule("salsify:version", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:version/@4"), null, null),
                       new PropertyRule("salsify:profile_asset_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:profile_asset_id/@1"), null, null),
                       new PropertyRule("salsify:system_id", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:system_id/@16"), null, null),
                       new PropertyRule("Search Keywords", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Search Keywords/@16"), null, null),
                       new PropertyRule("Main Product Image", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Main Product Image/@16"), null, null),
                       new PropertyRule("MFG Name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Name/@16"), null, null),
                       new PropertyRule("Product Name", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Product Name/@16"), null, null),
                       new PropertyRule("Marketing Copy", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Marketing Copy/@16"), null, null),
                       new PropertyRule("MFG Part # (OEM)", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Part # (OEM)/@16"), null, null),
                       new PropertyRule("Short Description", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Short Description/@16"), null, null),
                       new PropertyRule("BUYABLE", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//BUYABLE/@2"), null, null),
                       new PropertyRule("MFG Part # Character Count", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Part # Character Count/@16"), null, null),
                       new PropertyRule("SEO Brand Name Display", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//SEO Brand Name Display/@16"), null, null),
                       new PropertyRule("  SEO URL Keyword Character Count", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//  SEO URL Keyword Character Count/@16"), null, null),
                       new PropertyRule("SEO URL Keywword", NameMatchKind.Exact, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//SEO URL Keywword/@16"), null, null),
                   } ),
                   new PropertyGroup(PropertyGroupBehavior.Succeed, PropertyGroupBehavior.Fail, PropertyGroupBehavior.ContinueWithNext, new PropertyRule[]{
                       new PropertyRule("", NameMatchKind.All, new Reference("file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products/!additionalProperties/@127"), null, null),
                   } ),
                }),
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:created_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:updated_at/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:version/@4", 
                null, 
                new NumberAcceptor(null, null, null, null, null),
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:profile_asset_id/@1", 
                null, 
                null,
                null,
                new NullAcceptor(),
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//salsify:system_id/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Search Keywords/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Main Product Image/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Product Name/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Marketing Copy/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Part # (OEM)/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//Short Description/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//BUYABLE/@2", 
                null, 
                null,
                new BooleanAcceptor(true, true),
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//MFG Part # Character Count/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//SEO Brand Name Display/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//  SEO URL Keyword Character Count/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products//properties//SEO URL Keywword/@16", 
                new StringAcceptor(null, null, null, null), 
                null,
                null,
                null,
                null,
                null,
                new AlsoAcceptor[]{}
            ),
            new ValueAcceptor(
                "file:///C:/Users/admin/Desktop/output%20files/cdwjson_2.schema.json#//definitions//products/!additionalProperties/@127", 
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

    };
}    
