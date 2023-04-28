import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { Container, Header, Icon, Item, Input, Text } from "native-base";

import ProductList from "./ProductList";
import SearchedProduct from "./SearchedProducts";
import Banner from "../../Shared/Banner";

var { height } = Dimensions.get("window");

const ProductContainer = (props) => {
  const [products, setProducts] = useState([]);
  const [productsFiltered, setProductsFiltered] = useState([]);
  const [focus, setFocus] = useState();
  const [active, setActive] = useState();

  // Product Methods
  const searchProduct = (text) => {
    setProductsFiltered(
      products.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const openList = () => {
    setFocus(true);
  };

  const onBlur = () => {
    setFocus(false);
  };

  // Categories

  return (
    <>
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              placeholder="Search"
              onFocus={openList}
              onChangeText={(text) => searchProduct(text)}
            />
            {focus == true ? <Icon onPress={onBlur} name="ios-close" /> : null}
          </Item>
        </Header>
        {focus == true ? (
          <SearchedProduct
            navigation={props.navigation}
            productsFiltered={productsFiltered}
          />
        ) : (
          <ScrollView>
            <View>
              <View>
                <Banner />
              </View>

              <View style={styles.listContainer}>
                {products.map((item) => {
                  return (
                    <ProductList
                      navigation={props.navigation}
                      key={item.name}
                      item={item}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    backgroundColor: "gainsboro",
  },
  listContainer: {
    height: height,
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    backgroundColor: "gainsboro",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductContainer;
