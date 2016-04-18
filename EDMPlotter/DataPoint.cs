using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EDMPlotter
{
    public class DataPoint
    {
        public double x_val, y_val;
        public DataPoint(double x, double y)
        {
            x_val = x;
            y_val = y;
        }
    }

}