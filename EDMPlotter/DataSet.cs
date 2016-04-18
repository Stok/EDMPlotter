using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace EDMPlotter
{
    public class DataSet
    {

        public List<DataPoint> data;

        public DataSet()
        {
            data = new List<DataPoint>();
        }

        public int Length
        {
            get { return data.Count; }
        }

        public void Add(DataPoint p)
        {
            data.Add(p);
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(data.ToArray());
        }


    }
}