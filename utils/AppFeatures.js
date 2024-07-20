class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    
    }
    filter (){
        const queryObj ={...this.queryString};
        const excludefields =['page','limit','sort','fields'];
        excludefields.forEach(ele=> delete queryObj[ele]);
        const queryStr = JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b gte| gt | lte | lt \b/g, match => `$${match}` );
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            throw new Error ('Invalid query string')
        }
        return this ;
    }
    limitFields (){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query=this.query.select('- __v');
        }
        return this;
    }
    paginate(){
        if(this.queryString.page){
            const page = this.queryString.page;
            const limit = this.queryString.limit;
            const skip = (page-1)*limit;
            this.query = this.query.skip(skip).limit(limit);
    
    }
    return this ;

}
}